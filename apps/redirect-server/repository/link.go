package repository

import (
	"time"
)

type Link struct {
	ID               string            `json:"id"`
	Slug             string            `json:"slug,omitempty"`
	URL              string            `json:"url,omitempty"`
	CreatedAt        *time.Time        `json:"created_at,omitempty"`
	ExpiresAt        *time.Time        `json:"expiresAt,omitempty"`
	Ios              string            `json:"ios,omitempty"`
	Android          string            `json:"android,omitempty"`
	Geo              map[string]string `json:"geo,omitempty"`
	UploadedImageUrl string            `json:"uploadedImageUrl,omitempty"`
}
