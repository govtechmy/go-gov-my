package repository

import "time"

type RedirectMetadata struct {
	LinkID          string    `json:"linkId"`
	CountryCode     string    `json:"countryCode"`
	Latitude        float32   `json:"latitude"`
	Longitude       float32   `json:"longitude"`
	DeviceType      string    `json:"deviceType"`
	Browser         string    `json:"browser"`
	OperatingSystem string    `json:"operatingSystem"`
	IPAddress       string    `json:"ipAddress"`
	Referer         string    `json:"referer"`
	Timestamp       time.Time `json:"timestamp"`
}
