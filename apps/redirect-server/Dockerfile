# Build the Go app
FROM golang:1.18 as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o redirect-service main.go

# Run the Go app
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/redirect-service .

CMD ["./redirect-service"]
