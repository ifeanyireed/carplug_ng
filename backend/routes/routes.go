package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/controllers"
	"github.com/ifeanyireed/carplug_ng/backend/middleware"
)

func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(allowedOrigins))
	for _, o := range allowedOrigins {
		allowed[o] = true
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if allowed[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if origin == "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

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

	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)

	api := r.Group("/api")
	{
		// Health check (Public)
		api.GET("/health", controllers.CheckHealth)

		// Authentication (Public & Protected)
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/me", authMiddleware, controllers.GetMe)
		}

		// Vehicles
		vehicles := api.Group("/vehicles")
		{
			// Public discovery
			vehicles.GET("", controllers.GetVehicles)
			vehicles.GET("/:id", controllers.GetVehicleByID)

			// Protected mutations
			vehicles.POST("", authMiddleware, controllers.CreateVehicle)
			vehicles.PUT("/:id", authMiddleware, controllers.UpdateVehicle)
			vehicles.DELETE("/:id", authMiddleware, controllers.DeleteVehicle)
		}

		// Dealer Shops
		dealers := api.Group("/dealers")
		{
			// Public discovery
			dealers.GET("", controllers.GetDealers)
			dealers.GET("/:id", controllers.GetDealerBySlugOrID)
			dealers.GET("/:id/inventory", controllers.GetDealerInventory)

			// Protected registration
			dealers.POST("", authMiddleware, controllers.CreateDealer)
		}

		// Technicians (Public discovery)
		technicians := api.Group("/technicians")
		{
			technicians.GET("", controllers.GetTechnicians)
			technicians.GET("/:id", controllers.GetTechnicianByID)
		}

		// Inspections
		inspections := api.Group("/inspections")
		{
			// Public lookup
			inspections.GET("", controllers.GetInspections)
			inspections.GET("/:id", controllers.GetInspectionByID)

			// Protected order & status update
			inspections.POST("", authMiddleware, controllers.CreateInspection)
			inspections.PATCH("/:id/status", authMiddleware, controllers.UpdateInspectionStatus)
		}

		// Leads & Inquiries
		leads := api.Group("/leads")
		{
			// Public lead submission
			leads.POST("", controllers.CreateLead)

			// Protected CRM lead viewing & status routing
			leads.GET("", authMiddleware, controllers.GetLeads)
			leads.PATCH("/:id/status", authMiddleware, controllers.UpdateLeadStatus)
		}

		// Swaps & Trade-ins
		swaps := api.Group("/swaps")
		{
			// Public read
			swaps.GET("", controllers.GetSwaps)

			// Protected submission & status update
			swaps.POST("", authMiddleware, controllers.CreateSwap)
			swaps.PATCH("/:id/status", authMiddleware, controllers.UpdateSwapStatus)
		}

		// Advertising Campaigns
		campaigns := api.Group("/campaigns")
		{
			// Public read
			campaigns.GET("", controllers.GetCampaigns)

			// Protected campaign creation & moderation
			campaigns.POST("", authMiddleware, controllers.CreateCampaign)
			campaigns.PATCH("/:id/status", authMiddleware, controllers.UpdateCampaignStatus)
		}

		// Saved / Favorited Vehicles (All strictly protected)
		saved := api.Group("/saved-vehicles")
		saved.Use(authMiddleware)
		{
			saved.GET("", controllers.GetSavedVehicles)
			saved.GET("/ids", controllers.GetSavedVehicleIDs)
			saved.POST("/:vehicleId", controllers.SaveVehicle)
			saved.DELETE("/:vehicleId", controllers.RemoveSavedVehicle)
			saved.POST("/toggle/:vehicleId", controllers.ToggleSavedVehicle)
		}

		// Image Uploads (Cloudinary - Protected)
		upload := api.Group("/upload")
		upload.Use(authMiddleware)
		{
			upload.POST("/images", controllers.UploadImages)
		}
	}

	return r
}

