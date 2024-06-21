# Use the official Golang image for building the Go app
FROM golang:1.18 as builder

WORKDIR /app

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o redirect-service main.go

# Use a lightweight image for running the Go app
FROM alpine:latest

WORKDIR /root/

# Copy the built Go application from the builder stage
COPY --from=builder /app/redirect-service .

# Set the command to run the Go application
CMD ["./redirect-service"]
