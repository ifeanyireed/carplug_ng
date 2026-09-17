package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
	"github.com/ifeanyireed/carplug_ng/backend/config"
)

type CloudinaryUploader struct {
	cld *cloudinary.Cloudinary
}

var Uploader *CloudinaryUploader

// InitCloudinary initializes the global Cloudinary client using AppConfig credentials.
func InitCloudinary() error {
	cfg := config.AppConfig
	if cfg.CloudinaryCloudName == "" || cfg.CloudinaryAPIKey == "" || cfg.CloudinaryAPISecret == "" {
		return fmt.Errorf("cloudinary credentials not fully configured")
	}

	cld, err := cloudinary.NewFromParams(cfg.CloudinaryCloudName, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret)
	if err != nil {
		return fmt.Errorf("failed to initialize Cloudinary: %w", err)
	}

	Uploader = &CloudinaryUploader{cld: cld}
	return nil
}

// UploadImage uploads a single file to Cloudinary in the given folder and returns the secure URL.
func (cu *CloudinaryUploader) UploadImage(ctx context.Context, fileHeader *multipart.FileHeader, folder string) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	if folder == "" {
		folder = "carplug/vehicles"
	}

	// Extract base filename without extension
	ext := filepath.Ext(fileHeader.Filename)
	base := strings.TrimSuffix(filepath.Base(fileHeader.Filename), ext)
	cleanName := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '_'
	}, base)

	publicID := fmt.Sprintf("%s_%d_%s", cleanName, time.Now().Unix(), uuid.New().String()[:8])

	uploadParams := uploader.UploadParams{
		Folder:   folder,
		PublicID: publicID,
	}

	res, err := cu.cld.Upload.Upload(ctx, file, uploadParams)
	if err != nil {
		return "", fmt.Errorf("cloudinary upload error: %w", err)
	}

	if res.Error.Message != "" {
		return "", fmt.Errorf("cloudinary API error: %s", res.Error.Message)
	}

	if res.SecureURL != "" {
		return res.SecureURL, nil
	}
	if res.URL != "" {
		return res.URL, nil
	}

	return "", fmt.Errorf("cloudinary returned an empty URL for uploaded asset")
}
