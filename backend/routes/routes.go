package routes

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/controllers"
	"github.com/ifeanyireed/carplug_ng/backend/middleware"
)

func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(allowedOrigins))
	for _, o := range allowedOrigins {
		allowed[strings.TrimSpace(o)] = true
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		isAllowed := allowed[origin] || allowed[strings.TrimRight(origin, "/")]

		// Always permit localhost / loopback development ports
		if !isAllowed && origin != "" {
			if strings.HasPrefix(origin, "http://localhost:") ||
				strings.HasPrefix(origin, "http://127.0.0.1:") ||
				strings.HasPrefix(origin, "http://[::1]:") ||
				origin == "http://localhost" ||
				origin == "http://127.0.0.1" {
				isAllowed = true
			}
		}

		if isAllowed {
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
			auth.PUT("/profile", authMiddleware, controllers.UpdateProfile)
			auth.PUT("/password", authMiddleware, controllers.ChangePassword)
			auth.PATCH("/role", authMiddleware, controllers.UpgradeRole)
			auth.POST("/upgrade-role", authMiddleware, controllers.UpgradeRole)
		}

		// Vehicles
		vehicles := api.Group("/vehicles")
		{
			// Public discovery
			vehicles.GET("", controllers.GetVehicles)
			vehicles.GET("/:id", controllers.GetVehicleByID)

			// Protected mutations
			vehicles.POST("", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.CreateVehicle)
			vehicles.PUT("/:id", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.UpdateVehicle)
			vehicles.DELETE("/:id", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.DeleteVehicle)
		}

		// Dealer Shops
		dealers := api.Group("/dealers")
		{
			// Public discovery
			dealers.GET("", controllers.GetDealers)
			dealers.GET("/me", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.GetDealerMeShop)
			dealers.GET("/me/subscription", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.GetDealerSubscription)
			dealers.POST("/subscription/upgrade", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.UpgradeDealerSubscription)
			dealers.GET("/:id", controllers.GetDealerBySlugOrID)
			dealers.GET("/:id/inventory", controllers.GetDealerInventory)

			// Protected mutations
			dealers.POST("", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.CreateDealer)
			dealers.PUT("/:id", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.UpdateDealer)
		}

		// Technicians (Public discovery & authenticated technician endpoints)
		technicians := api.Group("/technicians")
		{
			technicians.GET("", controllers.GetTechnicians)
			technicians.GET("/me/inspections", authMiddleware, middleware.RequireRoles("technician", "admin"), controllers.GetTechnicianMeInspections)
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
			inspections.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("technician", "admin"), controllers.UpdateInspectionStatus)
			inspections.POST("/:id/report", authMiddleware, middleware.RequireRoles("technician", "admin"), controllers.SubmitInspectionReport)
		}

		// Leads & Inquiries
		leads := api.Group("/leads")
		{
			// Public lead submission
			leads.POST("", controllers.CreateLead)

			// Protected CRM lead viewing & status routing
			leads.GET("", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.GetLeads)
			leads.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.UpdateLeadStatus)
		}

		// Swaps & Trade-ins
		swaps := api.Group("/swaps")
		{
			// Public read
			swaps.GET("", controllers.GetSwaps)

			// Protected submission & status update
			swaps.POST("", authMiddleware, controllers.CreateSwap)
			swaps.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("admin"), controllers.UpdateSwapStatus)
		}

		// Advertising Campaigns
		campaigns := api.Group("/campaigns")
		{
			// Public read
			campaigns.GET("", controllers.GetCampaigns)

			// Protected campaign creation & moderation
			campaigns.POST("", authMiddleware, middleware.RequireRoles("admin"), controllers.CreateCampaign)
			campaigns.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("admin"), controllers.UpdateCampaignStatus)
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

		// Conversations & Messaging (Direct Chat - All strictly protected)
		conversations := api.Group("/conversations")
		conversations.Use(authMiddleware)
		{
			conversations.POST("", controllers.StartConversation)
			conversations.GET("", controllers.GetConversations)
			conversations.GET("/:id", controllers.GetConversationByID)
			conversations.GET("/:id/messages", controllers.GetMessages)
			conversations.POST("/:id/messages", controllers.SendMessage)
		}

		// Document Verifications & KYC Compliance Queue (Protected)
		verifications := api.Group("/verifications")
		verifications.Use(authMiddleware)
		{
			verifications.POST("", controllers.SubmitVerification)
			verifications.GET("", controllers.GetVerifications)
			verifications.PATCH("/:id/status", middleware.RequireRoles("admin"), controllers.UpdateVerificationStatus)
		}

		// Financial Ledger, Escrow & Wallet
		payments := api.Group("/payments")
		{
			payments.POST("/webhook", controllers.HandleWebhook)

			// Authenticated actions
			payments.Use(authMiddleware)
			payments.GET("/transactions", middleware.RequireRoles("admin"), controllers.GetTransactions)
			payments.GET("/wallet", controllers.GetWallet)
			payments.POST("/initialize", controllers.InitializePayment)
			payments.POST("/payout", middleware.RequireRoles("technician", "admin"), controllers.RequestPayout)
		}

		// Admin Governance & Moderation (Protected - Admin only)
		admin := api.Group("/admin")
		admin.Use(authMiddleware, middleware.RequireRoles("admin"))
		{
			admin.GET("/metrics", controllers.GetAdminMetrics)
			admin.GET("/flagged-listings", controllers.GetFlaggedListings)
			admin.PATCH("/listings/:id/status", controllers.ModerateListingStatus)
		}
	}

	return r
}

