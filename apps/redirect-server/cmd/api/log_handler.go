package main

import "log"

func logHandler (msg string, err error) {
	log.Printf("%s: %s", msg, err)
}

func logFatalHandler (msg string, err error) {
	log.Fatalf("%s: %s", msg, err)
}