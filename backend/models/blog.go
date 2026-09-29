package models

import (
	"time"

	"gorm.io/gorm"
)

type BlogPostStatus string

const (
	StatusDraft     BlogPostStatus = "draft"
	StatusPublished BlogPostStatus = "published"
	StatusArchived  BlogPostStatus = "archived"
)

// BlogCategory categorizes articles (e.g. "News", "Tips and Tricks", "Car Reviews")
type BlogCategory struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	Name        string    `gorm:"size:100;uniqueIndex;not null" json:"name"`
	Slug        string    `gorm:"size:120;uniqueIndex;not null" json:"slug"`
	Description string    `gorm:"size:255" json:"description,omitempty"`
	PostCount   int       `gorm:"-" json:"postCount"` // Computed dynamically
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// BlogTag represents topic keywords assigned to articles
type BlogTag struct {
	ID        string    `gorm:"primaryKey;size:64" json:"id"`
	Name      string    `gorm:"size:60;uniqueIndex;not null" json:"name"`
	Slug      string    `gorm:"size:80;uniqueIndex;not null" json:"slug"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BlogPost represents a published or draft editorial/blog article
type BlogPost struct {
	ID            string         `gorm:"primaryKey;size:64" json:"id"`
	Title         string         `gorm:"size:255;not null" json:"title"`
	Slug          string         `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Excerpt       string         `gorm:"type:text;not null" json:"excerpt"`
	Content       string         `gorm:"type:text;not null" json:"content"` // Rich HTML/Markdown from WYSIWYG
	CoverImage    string         `gorm:"size:500;not null" json:"coverImage"`
	CoverImageAlt string         `gorm:"size:255" json:"coverImageAlt"`

	// Category
	CategoryID string       `gorm:"size:64;index;not null" json:"categoryId"`
	Category   BlogCategory `gorm:"foreignKey:CategoryID" json:"category"`

	// Tags (Many-to-Many)
	Tags []BlogTag `gorm:"many2many:blog_post_tags;" json:"tags"`

	// Author
	AuthorID     string `gorm:"size:64;index" json:"authorId,omitempty"`
	AuthorName   string `gorm:"size:100;default:'Carplug Editorial'" json:"authorName"`
	AuthorRole   string `gorm:"size:100;default:'Editor'" json:"authorRole"`
	AuthorAvatar string `gorm:"size:500" json:"authorAvatar,omitempty"`

	// Publishing & Metrics
	Status      BlogPostStatus `gorm:"size:20;default:'draft';index" json:"status"`
	Featured    bool           `gorm:"default:false;index" json:"featured"`
	ReadTime    string         `gorm:"size:50" json:"readTime"`
	ViewsCount  int            `gorm:"default:0" json:"viewsCount"`
	PublishedAt *time.Time     `gorm:"index" json:"publishedAt,omitempty"`

	// SEO
	MetaTitle       string `gorm:"size:255" json:"metaTitle,omitempty"`
	MetaDescription string `gorm:"size:500" json:"metaDescription,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
