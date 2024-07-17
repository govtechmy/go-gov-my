package main

import "redirect-server/repository"

type LinkAnalytics struct {
	LinkID          string           `json:"linkId"`
	Total           int              `json:"total"`
	LinkSlug        AggregatedValues `json:"linkSlug"`
	LinkUrl         AggregatedValues `json:"linkUrl"`
	CountryCode     AggregatedValues `json:"countryCode"`
	DeviceType      AggregatedValues `json:"deviceType"`
	Browser         AggregatedValues `json:"browser"`
	OperatingSystem AggregatedValues `json:"operatingSystem"`
	Referer         AggregatedValues `json:"referer"`
}

type AggregatedValues = map[string]int

func NewLinkAnalytics(linkID string) *LinkAnalytics {
	return &LinkAnalytics{
		LinkID:          linkID,
		Total:           0,
		LinkSlug:        make(map[string]int),
		LinkUrl:         make(map[string]int),
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
		a.LinkSlug[metadata.LinkSlug] += 1
		a.LinkUrl[metadata.LinkURL] += 1
		if metadata.CountryCode != "" {
			a.CountryCode[metadata.CountryCode] += 1
		}
		if metadata.DeviceType != "" {
			a.DeviceType[metadata.DeviceType] += 1
		}
		if metadata.Browser != "" {
			a.Browser[metadata.Browser] += 1
		}
		if metadata.OperatingSystem != "" {
			a.OperatingSystem[metadata.OperatingSystem] += 1
		}
		if metadata.Referer != "" {
			a.Referer[metadata.Referer] += 1
		}
	}

	analytics := make([]LinkAnalytics, 0)
	for _, a := range analyticsMap {
		analytics = append(analytics, *a)
	}

	return analytics, nil
}
