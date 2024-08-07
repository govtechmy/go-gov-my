package utils

import (
	"net/http"
	"strings"

	"golang.org/x/time/rate"
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


func IsBot(userAgent string) bool {
	lowerUserAgent := strings.ToLower(userAgent)
	for _, crawler := range Crawlers {
		if strings.Contains(lowerUserAgent, strings.ToLower(crawler)) {
			return true
		}
	}
	return false
}


func RateLimiter(next http.Handler) http.Handler {
	limiter := rate.NewLimiter(10, 20) // 10 request per second with a burst of 20 requests

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Please add more if we discover more bots...
var Crawlers = []string{
	"bot",
	"Amazonbot",
	"Applebot-Extended",
	"ClaudeBot",
	"Google-Extended",
	"GPTBot",
	"PetalBot",
	"viberbot",
	"YaK",
	"Applebot",
	"Bingbot",
	"Discordbot",
	"DuckDuckBot",
	"facebookexternalhit",
	"Googlebot",
	"Googlebot-Image",
	"LinkedInBot",
	"msnbot",
	"Naverbot",
	"Pinterestbot",
	"Screaming Frog SEO Spider",
	"seznambot",
	"Slurp",
	"teoma",
	"TelegramBot",
	"Twitterbot",
	"Yandex",
	"Yeti",
	"crawler",
	"spider",
	"80legs",
	"baidu",
	"yahoo! slurp",
	"ia_archiver",
	"mediapartners-google",
	"lwp-trivial",
	"nederland.zoek",
	"ahoy",
	"anthill",
	"appie",
	"arale",
	"araneo",
	"ariadne",
	"atn_worldwide",
	"atomz",
	"bjaaland",
	"ukonline",
	"calif",
	"combine",
	"cosmos",
	"cusco",
	"cyberspyder",
	"digger",
	"grabber",
	"downloadexpress",
	"ecollector",
	"ebiness",
	"esculapio",
	"esther",
	"felix ide",
	"hamahakki",
	"kit-fireball",
	"fouineur",
	"freecrawl",
	"desertrealm",
	"gcreep",
	"golem",
	"griffon",
	"gromit",
	"gulliver",
	"gulper",
	"whowhere",
	"havindex",
	"hotwired",
	"htdig",
	"ingrid",
	"informant",
	"inspectorwww",
	"iron33",
	"teoma",
	"ask jeeves",
	"jeeves",
	"image.kapsi.net",
	"kdd-explorer",
	"label-grabber",
	"larbin",
	"linkidator",
	"linkwalker",
	"lockon",
	"marvin",
	"mattie",
	"mediafox",
	"merzscope",
	"nec-meshexplorer",
	"udmsearch",
	"moget",
	"motor",
	"muncher",
	"muninn",
	"muscatferret",
	"mwdsearch",
	"sharp-info-agent",
	"webmechanic",
	"netscoop",
	"newscan-online",
	"objectssearch",
	"orbsearch",
	"packrat",
	"pageboy",
	"parasite",
	"patric",
	"pegasus",
	"phpdig",
	"piltdownman",
	"pimptrain",
	"plumtreewebaccessor",
	"getterrobo-plus",
	"raven",
	"roadrunner",
	"robbie",
	"robocrawl",
	"robofox",
	"webbandit",
	"scooter",
	"search-au",
	"searchprocess",
	"senrigan",
	"shagseeker",
	"site valet",
	"skymob",
	"slurp",
	"snooper",
	"speedy",
	"curl_image_client",
	"suke",
	"www.sygol.com",
	"tach_bw",
	"templeton",
	"titin",
	"topiclink",
	"udmsearch",
	"urlck",
	"valkyrie libwww-perl",
	"verticrawl",
	"victoria",
	"webscout",
	"voyager",
	"crawlpaper",
	"webcatcher",
	"t-h-u-n-d-e-r-s-t-o-n-e",
	"webmoose",
	"pagesinventory",
	"webquest",
	"webreaper",
	"webwalker",
	"winona",
	"occam",
	"robi",
	"fdse",
	"jobo",
	"rhcs",
	"gazz",
	"dwcp",
	"yeti",
	"fido",
	"wlm",
	"wolp",
	"wwwc",
	"xget",
	"legs",
	"curl",
	"webs",
	"wget",
	"sift",
	"cmc",
};
