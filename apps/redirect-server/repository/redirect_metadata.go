package repository

import "time"

type RedirectMetadata struct {
	LinkID          string    `json:"linkId"`
	LinkSlug        string    `json:"linkSlug"`
	LinkURL         string    `json:"linkUrl"`
	CountryCode     string    `json:"countryCode,omitempty"`
	Latitude        float32   `json:"latitude,omitempty"`
	Longitude       float32   `json:"longitude,omitempty"`
	DeviceType      string    `json:"deviceType,omitempty"`
	Browser         string    `json:"browser,omitempty"`
	OperatingSystem string    `json:"operatingSystem,omitempty"`
	IPAddress       string    `json:"ipAddress,omitempty"`
	Referer         string    `json:"referer,omitempty"`
	Timestamp       time.Time `json:"timestamp"`
}
