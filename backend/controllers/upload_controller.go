package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".avif": true,
	".heic": true,
}

var allowedFolders = map[string]bool{
	"carplug/vehicles":    true,
	"carplug/avatars":     true,
	"carplug/inspections": true,
	"carplug/documents":   true,
	"carplug/campaigns":   true,
}

// UploadImages handles multipart/form-data upload for one or multiple images
// POST /api/upload/images
func UploadImages(c *gin.Context) {
	if utils.Uploader == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Cloudinary image service is not configured or unavailable",
		})
		return
	}

	// Limit upload size to 50MB
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 50<<20)

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form: " + err.Error()})
		return
	}

	folder := strings.TrimSpace(c.DefaultPostForm("folder", "carplug/vehicles"))
	if !allowedFolders[folder] {
		folder = "carplug/vehicles"
	}

	// Collect files from "images" or "image" fields
	files := form.File["images"]
	if len(files) == 0 {
		files = form.File["image"]
	}

	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image files were provided in request"})
		return
	}

	var uploadedURLs []string
	ctx := c.Request.Context()

	for _, fileHeader := range files {
		ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if !allowedExtensions[ext] {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("File format '%s' is not supported. Allowed formats: jpg, jpeg, png, webp, heic", ext),
			})
			return
		}

		url, err := utils.Uploader.UploadImage(ctx, fileHeader, folder)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to upload '%s': %v", fileHeader.Filename, err),
			})
			return
		}

		uploadedURLs = append(uploadedURLs, url)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Images uploaded successfully",
		"urls":    uploadedURLs,
		"count":   len(uploadedURLs),
	})
}
