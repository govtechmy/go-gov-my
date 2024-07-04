#!/bin/sh

# Check if POSTGRES_DB is defined
if [ -z "${POSTGRES_DB}" ]; then
    echo "POSTGRES_DB is not defined."
    exit 1
fi

# Check if POSTGRES_USER is defined
if [ -z "${POSTGRES_USER}" ]; then
    echo "POSTGRES_USER is not defined."
    exit 1
fi

# Check if POSTGRES_PASSWORD is defined
if [ -z "${POSTGRES_PASSWORD}" ]; then
    echo "POSTGRES_PASSWORD is not defined."
    exit 1
fi

CONNECTOR_NAME='postgres-connector'

CONNECTOR_CONFIG='{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "plugin.name": "pgoutput",
  "database.hostname": "ps-postgres",
  "database.port": "5432",
  "database.user": "'"$POSTGRES_USER"'",
  "database.password": "'"$POSTGRES_PASSWORD"'",
  "database.dbname": "'"$POSTGRES_DB"'",
  "database.server.name": "ps-postgres",
  "table.include.list": "public.WebhookOutbox"
}'

curl "http://debezium:8083/connectors/$CONNECTOR_NAME/config" \
--request 'PUT' \
--header 'Content-Type: application/json' \
--data "$CONNECTOR_CONFIG" \
--fail \
-v