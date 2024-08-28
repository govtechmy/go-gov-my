package utils

import (
	"net/http"
	"strings"
)

func GetClientIP(r *http.Request) string {
	// Get the IP from the X-Forwarded-For header, if available
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		// The X-Forwarded-For header can contain a comma-separated list of IPs
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}
	// Fall back to the remote address if X-Forwarded-For is not set
	return r.RemoteAddr
}
