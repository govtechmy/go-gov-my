package main

import "time"

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

type KafkaLinkAnalyticsMessage struct {
	AggregatedDate string          `json:"aggregatedDate"`
	From           time.Time       `json:"from"`
	To             time.Time       `json:"to"`
	LinkAnalytics  []LinkAnalytics `json:"linkAnalytics"`
}
