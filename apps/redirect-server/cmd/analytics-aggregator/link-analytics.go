package main

import "redirect-server/repository"

type LinkAnalytics struct {
	LinkID          string           `json:"linkId"`
	Total           int              `json:"total"`
	CountryCode     AggregatedValues `json:"countryCode:omitempty"`
	DeviceType      AggregatedValues `json:"deviceType:omitempty"`
	Browser         AggregatedValues `json:"browser:omitempty"`
	OperatingSystem AggregatedValues `json:"operatingSystem:omitempty"`
	Referer         AggregatedValues `json:"referer:omitempty"`
}

type AggregatedValues = map[string]int

func NewLinkAnalytics(linkID string) *LinkAnalytics {
	return &LinkAnalytics{
		LinkID:          linkID,
		Total:           0,
		CountryCode:     make(map[string]int),
		DeviceType:      make(map[string]int),
		Browser:         make(map[string]int),
		OperatingSystem: make(map[string]int),
		Referer:         make(map[string]int),
	}
}

func aggregateRedirectMetadata(redirectMetadata []repository.RedirectMetadata) ([]LinkAnalytics, error) {
	// Map LinkID to analytics
	analyticsMap := make(map[string]*LinkAnalytics)

	for _, metadata := range redirectMetadata {
		a := analyticsMap[metadata.LinkID]
		if a == nil {
			a = NewLinkAnalytics(metadata.LinkID)
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
