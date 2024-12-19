#!/bin/bash

# Check if minikube is running
if ! minikube status >/dev/null 2>&1; then
    echo "Starting minikube..."
    minikube start --memory=4096 --cpus=2
fi

# Create kafka namespace if it doesn't exist
if ! kubectl get namespace kafka >/dev/null 2>&1; then
    echo "Creating kafka namespace..."
    kubectl create namespace kafka
fi

# Install Strimzi operator
echo "Installing Strimzi operator..."
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Wait for operator to be ready
echo "Waiting for Strimzi operator to be ready..."
kubectl wait deployment/strimzi-cluster-operator --for=condition=Available --timeout=300s -n kafka

# Apply local configuration
echo "Applying local Kafka configuration..."
kubectl apply -k .kube/kafka-cluster/overlays/local -n kafka

# Wait for Kafka to be ready
echo "Waiting for Kafka cluster to be ready..."
kubectl wait kafka/gogov-kafka-cluster --for=condition=Ready --timeout=300s -n kafka

# Get bootstrap server
BOOTSTRAP_SERVER=$(kubectl get kafka gogov-kafka-cluster -n kafka -o=jsonpath='{.status.listeners[0].bootstrapServers}')
echo "Kafka cluster is ready!"
echo "Bootstrap Server: $BOOTSTRAP_SERVER" 