#!/bin/bash

ENV=$1

if [ "$ENV" = "local" ]; then
    echo "Configuring for local development..."
    
    # Apply local overlays
    kubectl apply -k .kube/kafka-cluster/overlays/local
    
    # Wait for Kafka to be ready
    kubectl wait kafka/gogov-kafka-cluster --for=condition=Ready --timeout=300s -n kafka
    
    # Get the bootstrap server
    BOOTSTRAP_SERVER=$(kubectl get kafka gogov-kafka-cluster -n kafka -o=jsonpath='{.status.listeners[?(@.type=="plain")].bootstrapServers}')
    
    echo "Kafka is ready!"
    echo "Bootstrap Server: $BOOTSTRAP_SERVER"
    echo "
    To use locally:
    export KAFKA_BROKER_URL=$BOOTSTRAP_SERVER
    export KAFKA_TOPIC=outbox-topic
    "
elif [ "$ENV" = "prod" ]; then
    echo "Configuring for production..."
    kubectl apply -k .kube/kafka-cluster/overlays/prod
else
    echo "Usage: $0 [local|prod]"
    exit 1
fi 