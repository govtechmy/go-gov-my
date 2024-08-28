package repository_test

import (
	"net/http"
	"redirect-server/repository"
	"redirect-server/utils"
	"testing"

	"github.com/oschwald/geoip2-golang"
)

func TestNewRedirectMetadata(t *testing.T) {
	link := repository.Link{
		Slug: "foo",
		URL:  "https://www.example.com",
	}

	IP := "175.140.186.208"
	req := http.Request{
		Header: http.Header{
			"X-Forwarded-For": []string{IP},
		},
		RemoteAddr: "0.0.0.0",
	}

	ipDB, err := geoip2.Open("../GeoLite2-City.mmdb")
	if err != nil {
		t.Fatal("cannot load geolite2 database")
	}
	defer ipDB.Close()

	gotIP := utils.GetClientIP(&req)
	if gotIP != IP {
		t.Fatalf("gotIP = %s, want %s", gotIP, IP)
	}

	redirMeta := repository.NewRedirectMetadata(req, ipDB, link)

	if redirMeta.CountryCode != "MY" {
		t.Fatalf("CountryCode = %s; want MY", redirMeta.CountryCode)
	}
	if redirMeta.City != "MY:Kuala Lumpur" {
		t.Fatalf("City = %s; want MY:Kuala Lumpur", redirMeta.City)
	}
}
