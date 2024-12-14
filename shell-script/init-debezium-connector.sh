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
        "database.hostname": "ps-postgres",
        "database.port": "5432",
        "database.user": "'"${POSTGRES_USER}"'",
        "database.password": "'"${POSTGRES_PASSWORD}"'",
        "database.dbname": "'"${POSTGRES_DB}"'",
        "database.server.name": "postgres",
        "table.include.list": "public.gogov-kafka-outbox-events",
        "topic.prefix": "postgres",
        "schema.history.internal.kafka.bootstrap.servers": "broker:29092",
        "schema.history.internal.kafka.topic": "schema-changes.gogov-kafka-outbox-events",
        "transforms": "outbox",
        "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
        "transforms.outbox.table.fields.additional.placement": "type:header:type",
        "transforms.outbox.table.field.event.key": "id",
        "transforms.outbox.table.field.event.payload": "payload",
        "transforms.outbox.route.by.field": "aggregate_type",
        "transforms.outbox.route.topic.replacement": "'"${KAFKA_OUTBOX_TOPIC}"'",
        "key.converter": "org.apache.kafka.connect.storage.StringConverter",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter.schemas.enable": "false"
}'

curl "http://debezium:8083/connectors/$CONNECTOR_NAME/config" \
--request 'PUT' \
--header 'Content-Type: application/json' \
--data "$CONNECTOR_CONFIG" \
--fail \
-v