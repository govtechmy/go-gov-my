package main

import "redirect-server/repository"

type LinkAnalytics struct {
	LinkID          string           `json:"linkId"`
	Total           int              `json:"total"`
	AggregationDate string           `json:"aggregationDate"` // UTC date in short format YYYY-MM-DD
	CountryCode     AggregatedValues `json:"countryCode"`
	DeviceType      AggregatedValues `json:"deviceType"`
	Browser         AggregatedValues `json:"browser"`
	OperatingSystem AggregatedValues `json:"operatingSystem"`
	Referer         AggregatedValues `json:"referer"`
}

type AggregatedValues = map[string]int

func NewLinkAnalytics(linkID string, shortDate string) *LinkAnalytics {
	return &LinkAnalytics{
		LinkID:          linkID,
		Total:           0,
		AggregationDate: shortDate,
		CountryCode:     make(map[string]int),
		DeviceType:      make(map[string]int),
		Browser:         make(map[string]int),
		OperatingSystem: make(map[string]int),
		Referer:         make(map[string]int),
	}
}

func aggregateRedirectMetadata(redirectMetadata []repository.RedirectMetadata, shortDate string) ([]LinkAnalytics, error) {
	// Map LinkID to analytics
	analyticsMap := make(map[string]*LinkAnalytics)

	for _, metadata := range redirectMetadata {
		a := analyticsMap[metadata.LinkID]
		if a == nil {
			a = NewLinkAnalytics(metadata.LinkID, shortDate)
			analyticsMap[metadata.LinkID] = a
		}

		a.Total += 1
		a.CountryCode[metadata.CountryCode] += 1
		a.DeviceType[metadata.DeviceType] += 1
		a.Browser[metadata.Browser] += 1
		a.OperatingSystem[metadata.OperatingSystem] += 1
		a.Referer[metadata.Referer] += 1
	}

	analytics := make([]LinkAnalytics, 0)
	for _, a := range analyticsMap {
		analytics = append(analytics, *a)
	}

	return analytics, nil
}
