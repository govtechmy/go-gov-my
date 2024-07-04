package main

import (
	"html/template"
	"log"
)

var t *template.Template

func InitTemplates() {
    var err error
    t, err = template.ParseGlob("templates/*.html")
    if err != nil {
        log.Fatalf("Error parsing the templates: %s", err)
    }
}
