package repository

import (
	"errors"
	"time"
)

var ErrLinkNotFound = errors.New("link not found")

type Link struct {
	Slug      string     `json:"slug,omitempty"`
	URL       string     `json:"url,omitempty"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
}
