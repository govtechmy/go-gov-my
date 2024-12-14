#!/bin/bash

echo "Cleaning up Kafka resources..."

# Delete all Kafka topics
echo "Deleting Kafka topics..."
kubectl delete -f .kube/kafka-cluster/base/kafka-topics.yaml -n kafka --ignore-not-found

# Delete Kafka Connect
echo "Deleting Kafka Connect..."
kubectl delete -f .kube/kafka-cluster/base/kafka-connect.yaml -n kafka --ignore-not-found

# Delete Kafka Cluster
echo "Deleting Kafka Cluster..."
kubectl delete -f .kube/kafka-cluster/base/kafka.yaml -n kafka --ignore-not-found

# Delete Strimzi Operator
echo "Deleting Strimzi Operator..."
kubectl delete -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka --ignore-not-found

# Delete PVCs
echo "Deleting Persistent Volume Claims..."
kubectl delete pvc -l strimzi.io/cluster=gogov-kafka-cluster -n kafka --ignore-not-found

# Delete Kafka namespace
echo "Deleting Kafka namespace..."
kubectl delete namespace kafka --ignore-not-found

# Optional: Delete minikube cluster entirely
read -p "Do you want to delete the entire minikube cluster? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Deleting minikube cluster..."
    minikube delete
fi

echo "Cleanup complete!" 