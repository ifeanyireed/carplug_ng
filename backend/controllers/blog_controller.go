package controllers

import (
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"gorm.io/gorm"
)

// Helper to generate URL-safe slugs
var nonWordRegex = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(text string) string {
	s := strings.ToLower(strings.TrimSpace(text))
	s = nonWordRegex.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

// Helper to calculate reading time based on 200 words per minute
func calculateReadTime(content string) string {
	// Strip HTML tags for word count
	re := regexp.MustCompile(`<[^>]*>`)
	plainText := re.ReplaceAllString(content, " ")
	words := strings.Fields(plainText)
	count := len(words)
	minutes := int(math.Ceil(float64(count) / 200.0))
	if minutes < 1 {
		minutes = 1
	}
	return fmt.Sprintf("%d min read", minutes)
}

// ---------------------------------------------------------------------------
// Public Discovery Endpoints
// ---------------------------------------------------------------------------

// GET /api/blog/posts
func GetBlogPosts(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.BlogPost{}).Where("status = ?", models.StatusPublished)

	// Filter by Category (slug or ID)
	if categoryParam := c.Query("category"); categoryParam != "" {
		var cat models.BlogCategory
		if err := db.Where("id = ? OR slug = ?", categoryParam, categoryParam).First(&cat).Error; err == nil {
			query = query.Where("category_id = ?", cat.ID)
		}
	}

	// Filter by Tag (slug or name)
	if tagParam := c.Query("tag"); tagParam != "" {
		var tag models.BlogTag
		if err := db.Where("id = ? OR slug = ? OR name = ?", tagParam, tagParam, tagParam).First(&tag).Error; err == nil {
			query = query.Joins("JOIN blog_post_tags ON blog_post_tags.blog_post_id = blog_posts.id").
				Where("blog_post_tags.blog_tag_id = ?", tag.ID)
		}
	}

	// Filter by Featured
	if c.Query("featured") == "true" {
		query = query.Where("featured = ?", true)
	}

	// Keyword search
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		likeTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(excerpt) LIKE ?", likeTerm, likeTerm)
	}

	// Total count for pagination
	var total int64
	query.Count(&total)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	var posts []models.BlogPost
	if err := query.Preload("Category").
		Preload("Tags").
		Order("featured desc, published_at desc, created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch articles: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  posts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GET /api/blog/posts/:slug
func GetBlogPostBySlug(c *gin.Context) {
	slugOrID := c.Param("slug")
	db := config.GetDB()

	var post models.BlogPost
	err := db.Preload("Category").
		Preload("Tags").
		Where("(slug = ? OR id = ?) AND status = ?", slugOrID, slugOrID, models.StatusPublished).
		First(&post).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found or not yet published"})
		return
	}

	// Atomically increment views count in background
	go func(postID string) {
		db.Model(&models.BlogPost{}).Where("id = ?", postID).UpdateColumn("views_count", gorm.Expr("views_count + 1"))
	}(post.ID)

	// Fetch related articles (same category or recent, excluding current)
	var related []models.BlogPost
	db.Preload("Category").
		Where("category_id = ? AND id != ? AND status = ?", post.CategoryID, post.ID, models.StatusPublished).
		Order("published_at desc").
		Limit(3).
		Find(&related)

	c.JSON(http.StatusOK, gin.H{
		"data":    post,
		"related": related,
	})
}

// GET /api/blog/categories
func GetBlogCategories(c *gin.Context) {
	db := config.GetDB()
	var categories []models.BlogCategory

	if err := db.Order("name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories: " + err.Error()})
		return
	}

	// Compute published post count per category
	for i := range categories {
		var cnt int64
		db.Model(&models.BlogPost{}).
			Where("category_id = ? AND status = ?", categories[i].ID, models.StatusPublished).
			Count(&cnt)
		categories[i].PostCount = int(cnt)
	}

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// GET /api/blog/tags
func GetBlogTags(c *gin.Context) {
	db := config.GetDB()
	var tags []models.BlogTag

	if err := db.Order("name asc").Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// ---------------------------------------------------------------------------
// Admin Editorial & CMS Endpoints
// ---------------------------------------------------------------------------

// GET /api/admin/blog/posts
func GetAdminBlogPosts(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.BlogPost{})

	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	if categoryID := c.Query("categoryId"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if search := strings.TrimSpace(c.Query("search")); search != "" {
		likeTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(excerpt) LIKE ?", likeTerm, likeTerm)
	}

	var total int64
	query.Count(&total)

	var posts []models.BlogPost
	if err := query.Preload("Category").
		Preload("Tags").
		Order("created_at desc").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load blog posts: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  posts,
		"total": total,
	})
}

type CreateBlogPostRequest struct {
	Title           string   `json:"title" binding:"required"`
	Slug            string   `json:"slug"`
	Excerpt         string   `json:"excerpt" binding:"required"`
	Content         string   `json:"content" binding:"required"`
	CoverImage      string   `json:"coverImage" binding:"required"`
	CoverImageAlt   string   `json:"coverImageAlt"`
	CategoryID      string   `json:"categoryId" binding:"required"`
	TagIDs          []string `json:"tagIds"`
	AuthorName      string   `json:"authorName"`
	AuthorRole      string   `json:"authorRole"`
	Status          string   `json:"status"` // "draft", "published", "archived"
	Featured        bool     `json:"featured"`
	MetaTitle       string   `json:"metaTitle"`
	MetaDescription string   `json:"metaDescription"`
}

// POST /api/admin/blog/posts
func CreateBlogPost(c *gin.Context) {
	var req CreateBlogPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	slug := req.Slug
	if strings.TrimSpace(slug) == "" {
		slug = slugify(req.Title)
	} else {
		slug = slugify(slug)
	}

	db := config.GetDB()

	// Ensure slug uniqueness
	var existingCount int64
	db.Model(&models.BlogPost{}).Where("slug = ?", slug).Count(&existingCount)
	if existingCount > 0 {
		slug = fmt.Sprintf("%s-%d", slug, time.Now().Unix()%10000)
	}

	status := models.BlogPostStatus(req.Status)
	if status == "" {
		status = models.StatusDraft
	}

	now := time.Now()
	var publishedAt *time.Time
	if status == models.StatusPublished {
		publishedAt = &now
	}

	authorName := strings.TrimSpace(req.AuthorName)
	if authorName == "" {
		authorName = "Carplug Editorial Board"
	}
	authorRole := strings.TrimSpace(req.AuthorRole)
	if authorRole == "" {
		authorRole = "Staff Writer"
	}

	readTime := calculateReadTime(req.Content)

	post := models.BlogPost{
		ID:              "post-" + strconv.FormatInt(time.Now().UnixNano(), 36),
		Title:           strings.TrimSpace(req.Title),
		Slug:            slug,
		Excerpt:         strings.TrimSpace(req.Excerpt),
		Content:         req.Content,
		CoverImage:      req.CoverImage,
		CoverImageAlt:   req.CoverImageAlt,
		CategoryID:      req.CategoryID,
		AuthorID:        c.GetString("userID"),
		AuthorName:      authorName,
		AuthorRole:      authorRole,
		Status:          status,
		Featured:        req.Featured,
		ReadTime:        readTime,
		PublishedAt:     publishedAt,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := db.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create article: " + err.Error()})
		return
	}

	// Associate tags if provided
	if len(req.TagIDs) > 0 {
		var tags []models.BlogTag
		db.Where("id IN ?", req.TagIDs).Find(&tags)
		if len(tags) > 0 {
			db.Model(&post).Association("Tags").Append(&tags)
		}
	}

	// Reload with relations
	db.Preload("Category").Preload("Tags").First(&post, "id = ?", post.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Article created successfully",
		"data":    post,
	})
}

// PUT /api/admin/blog/posts/:id
func UpdateBlogPost(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var post models.BlogPost
	if err := db.First(&post, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	var req CreateBlogPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	// Slug update check
	if strings.TrimSpace(req.Slug) != "" {
		newSlug := slugify(req.Slug)
		if newSlug != post.Slug {
			var cnt int64
			db.Model(&models.BlogPost{}).Where("slug = ? AND id != ?", newSlug, id).Count(&cnt)
			if cnt > 0 {
				newSlug = fmt.Sprintf("%s-%d", newSlug, time.Now().Unix()%10000)
			}
			post.Slug = newSlug
		}
	}

	post.Title = strings.TrimSpace(req.Title)
	post.Excerpt = strings.TrimSpace(req.Excerpt)
	post.Content = req.Content
	post.CoverImage = req.CoverImage
	post.CoverImageAlt = req.CoverImageAlt
	post.CategoryID = req.CategoryID
	post.Featured = req.Featured
	post.MetaTitle = req.MetaTitle
	post.MetaDescription = req.MetaDescription
	post.ReadTime = calculateReadTime(req.Content)
	post.UpdatedAt = time.Now()

	if req.AuthorName != "" {
		post.AuthorName = req.AuthorName
	}
	if req.AuthorRole != "" {
		post.AuthorRole = req.AuthorRole
	}

	newStatus := models.BlogPostStatus(req.Status)
	if newStatus != "" && newStatus != post.Status {
		post.Status = newStatus
		if newStatus == models.StatusPublished && post.PublishedAt == nil {
			now := time.Now()
			post.PublishedAt = &now
		}
	}

	if err := db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update article: " + err.Error()})
		return
	}

	// Sync tags
	var tags []models.BlogTag
	if len(req.TagIDs) > 0 {
		db.Where("id IN ?", req.TagIDs).Find(&tags)
	}
	db.Model(&post).Association("Tags").Replace(&tags)

	db.Preload("Category").Preload("Tags").First(&post, "id = ?", post.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Article updated successfully",
		"data":    post,
	})
}

// DELETE /api/admin/blog/posts/:id
func DeleteBlogPost(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var post models.BlogPost
	if err := db.First(&post, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	// Clear tags association and delete
	db.Model(&post).Association("Tags").Clear()
	if err := db.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete article: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted successfully", "id": id})
}

// ---------------------------------------------------------------------------
// Category & Tag Admin Handlers
// ---------------------------------------------------------------------------

type CategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

// POST /api/admin/blog/categories
func CreateBlogCategory(c *gin.Context) {
	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slug := req.Slug
	if strings.TrimSpace(slug) == "" {
		slug = slugify(req.Name)
	} else {
		slug = slugify(slug)
	}

	category := models.BlogCategory{
		ID:          "cat-" + slugify(req.Name),
		Name:        strings.TrimSpace(req.Name),
		Slug:        slug,
		Description: strings.TrimSpace(req.Description),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	db := config.GetDB()
	if err := db.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Category created", "data": category})
}

// PUT /api/admin/blog/categories/:id
func UpdateBlogCategory(c *gin.Context) {
	id := c.Param("id")
	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var category models.BlogCategory
	if err := db.First(&category, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	category.Name = strings.TrimSpace(req.Name)
	if strings.TrimSpace(req.Slug) != "" {
		category.Slug = slugify(req.Slug)
	}
	category.Description = strings.TrimSpace(req.Description)
	category.UpdatedAt = time.Now()

	if err := db.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category updated", "data": category})
}

// DELETE /api/admin/blog/categories/:id
func DeleteBlogCategory(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	// Check if any posts are using this category
	var count int64
	db.Model(&models.BlogPost{}).Where("category_id = ?", id).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Cannot delete category with %d active articles. Reassign them first.", count)})
		return
	}

	if err := db.Delete(&models.BlogCategory{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted", "id": id})
}

type TagRequest struct {
	Name string `json:"name" binding:"required"`
	Slug string `json:"slug"`
}

// POST /api/admin/blog/tags
func CreateBlogTag(c *gin.Context) {
	var req TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slug := req.Slug
	if strings.TrimSpace(slug) == "" {
		slug = slugify(req.Name)
	} else {
		slug = slugify(slug)
	}

	tag := models.BlogTag{
		ID:        "tag-" + slug,
		Name:      strings.TrimSpace(req.Name),
		Slug:      slug,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	db := config.GetDB()
	if err := db.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tag created", "data": tag})
}

// PUT /api/admin/blog/tags/:id
func UpdateBlogTag(c *gin.Context) {
	id := c.Param("id")
	var req TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var tag models.BlogTag
	if err := db.First(&tag, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	tag.Name = strings.TrimSpace(req.Name)
	if strings.TrimSpace(req.Slug) != "" {
		tag.Slug = slugify(req.Slug)
	}
	tag.UpdatedAt = time.Now()

	if err := db.Save(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tag: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag updated", "data": tag})
}

// DELETE /api/admin/blog/tags/:id
func DeleteBlogTag(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	// Clear join table references
	db.Exec("DELETE FROM blog_post_tags WHERE blog_tag_id = ?", id)

	if err := db.Delete(&models.BlogTag{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tag: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag deleted", "id": id})
}
