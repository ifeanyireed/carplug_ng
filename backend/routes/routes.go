package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/controllers"
)

func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func SetupRouter(cfg *config.Config) *gin.Engine {
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(CORSMiddleware(cfg.AllowedOrigins))

	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", controllers.CheckHealth)

		// Vehicles
		vehicles := api.Group("/vehicles")
		{
			vehicles.GET("", controllers.GetVehicles)
			vehicles.GET("/:id", controllers.GetVehicleByID)
			vehicles.POST("", controllers.CreateVehicle)
			vehicles.PUT("/:id", controllers.UpdateVehicle)
			vehicles.DELETE("/:id", controllers.DeleteVehicle)
		}

		// Dealer Shops
		dealers := api.Group("/dealers")
		{
			dealers.GET("", controllers.GetDealers)
			dealers.GET("/:id", controllers.GetDealerBySlugOrID)
			dealers.GET("/:id/inventory", controllers.GetDealerInventory)
			dealers.POST("", controllers.CreateDealer)
		}

		// Technicians
		technicians := api.Group("/technicians")
		{
			technicians.GET("", controllers.GetTechnicians)
			technicians.GET("/:id", controllers.GetTechnicianByID)
		}

		// Inspections
		inspections := api.Group("/inspections")
		{
			inspections.GET("", controllers.GetInspections)
			inspections.GET("/:id", controllers.GetInspectionByID)
			inspections.POST("", controllers.CreateInspection)
			inspections.PATCH("/:id/status", controllers.UpdateInspectionStatus)
		}

		// Leads & Inquiries
		leads := api.Group("/leads")
		{
			leads.GET("", controllers.GetLeads)
			leads.POST("", controllers.CreateLead)
			leads.PATCH("/:id/status", controllers.UpdateLeadStatus)
		}

		// Swaps & Trade-ins
		swaps := api.Group("/swaps")
		{
			swaps.GET("", controllers.GetSwaps)
			swaps.POST("", controllers.CreateSwap)
			swaps.PATCH("/:id/status", controllers.UpdateSwapStatus)
		}

		// Advertising Campaigns
		campaigns := api.Group("/campaigns")
		{
			campaigns.GET("", controllers.GetCampaigns)
			campaigns.POST("", controllers.CreateCampaign)
			campaigns.PATCH("/:id/status", controllers.UpdateCampaignStatus)
		}
	}

	return r
}
