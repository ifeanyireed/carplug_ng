package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/routes"
)

func main() {
	log.Println("==================================================")
	log.Println("  Starting Carplug Nigeria Backend API Server... ")
	log.Println("==================================================")

	// 1. Load Config
	cfg := config.LoadConfig()

	// 2. Initialize Database with GORM
	_, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("[Server] Database initialization failed: %v", err)
	}

	// 3. Setup Routes
	r := routes.SetupRouter(cfg)

	// 4. Create HTTP Server
	serverAddr := ":" + cfg.Port
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 5. Start Server in Goroutine
	go func() {
		log.Printf("[Server] Server listening on http://localhost%s\n", serverAddr)
		log.Printf("[Server] API endpoints ready at http://localhost%s/api/...\n", serverAddr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("[Server] Listen failed: %s\n", err)
		}
	}()

	// 6. Graceful Shutdown on SIGINT / SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[Server] Shutting down Carplug API Server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("[Server] Server forced to shutdown: ", err)
	}

	log.Println("[Server] Server exiting cleanly.")
}
