#!/bin/bash

# Set up the Debezium PostgreSQL connector
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/ -d @postgres-connector.json

# Set up the Elasticsearch Sink connector
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/ -d @elastic-connector.json
