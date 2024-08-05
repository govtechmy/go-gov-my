package repository

import (
	"net"
	"net/http"
	"redirect-server/utils"
	"time"

	"github.com/mileusna/useragent"
	"github.com/oschwald/geoip2-golang"
	"go.uber.org/zap/zapcore"
)

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

func NewRedirectMetadata(req http.Request, ipDB *geoip2.Reader, link Link) RedirectMetadata {
	redirectMetadata := RedirectMetadata{
		LinkID:   link.ID,
		LinkSlug: link.Slug,
		Referer:  req.Header.Get("Referer"),
	}

	// Parse Date
	t, err := time.Parse("Mon, 02 Jan 2006 15:04:05 MST", req.Header.Get("Date"))
	if err != nil {
		t = time.Now() // Use current time if parse fails
	}
	redirectMetadata.Timestamp = t

	// Parse User-Agent
	userAgent := req.UserAgent()
	if userAgent != "" {
		ua := useragent.Parse(userAgent)
		switch {
		case ua.Desktop:
			redirectMetadata.DeviceType = "desktop"
		case ua.Mobile:
			redirectMetadata.DeviceType = "mobile"
		case ua.Tablet:
			redirectMetadata.DeviceType = "tablet"
		}
		redirectMetadata.Browser = ua.Name
		redirectMetadata.OperatingSystem = ua.OS
	}

	// Parse IP
	ip := net.ParseIP(utils.GetClientIP(&req))
	if ip != nil && ipDB != nil {
		redirectMetadata.IPAddress = ip.String()
		city, err := ipDB.City(ip)
		if err == nil && city != nil {
			redirectMetadata.Longitude = float32(city.Location.Longitude)
			redirectMetadata.Latitude = float32(city.Location.Longitude)
			redirectMetadata.CountryCode = city.Country.IsoCode
		}
	}

	// Determine link URL (default, geo-specific, ios or android)
	countryCode := redirectMetadata.CountryCode
	os := redirectMetadata.OperatingSystem

	if countryCode != "" && link.Geo != nil && link.Geo[countryCode] != "" {
		redirectMetadata.LinkURL = link.Geo[countryCode]
	} else if os == "iOS" && link.Ios != "" {
		redirectMetadata.LinkURL = link.Ios
	} else if os == "Android" && link.Android != "" {
		redirectMetadata.LinkURL = link.Android
	} else {
		redirectMetadata.LinkURL = link.URL
	}

	return redirectMetadata
}

// For zap.Logger to log
func (redirectMetadata RedirectMetadata) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddString("linkId", redirectMetadata.LinkID)
	enc.AddString("linkSlug", redirectMetadata.LinkSlug)
	enc.AddString("linkUrl", redirectMetadata.LinkURL)
	if redirectMetadata.CountryCode != "" {
		enc.AddString("countryCode", redirectMetadata.CountryCode)
	}
	if redirectMetadata.Latitude != 0 {
		enc.AddFloat32("latitude", redirectMetadata.Latitude)
	}
	if redirectMetadata.Longitude != 0 {
		enc.AddFloat32("longitude", redirectMetadata.Longitude)
	}
	if redirectMetadata.DeviceType != "" {
		enc.AddString("deviceType", redirectMetadata.DeviceType)
	}
	if redirectMetadata.Browser != "" {
		enc.AddString("browser", redirectMetadata.Browser)
	}
	if redirectMetadata.OperatingSystem != "" {
		enc.AddString("operatingSystem", redirectMetadata.OperatingSystem)
	}
	if redirectMetadata.IPAddress != "" {
		enc.AddString("ipAddress", redirectMetadata.IPAddress)
	}
	if redirectMetadata.Referer != "" {
		enc.AddString("referer", redirectMetadata.Referer)
	}
	enc.AddString("timestamp", redirectMetadata.Timestamp.Format(time.RFC3339))
	return nil
}
