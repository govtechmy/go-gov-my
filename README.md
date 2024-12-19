<div align="center">
  <a href="https://go.gov.my">
  <img width="100" alt="GoGovMY - Malaysia's open-source link management infrastructure." src="./apps/web/public/_static/jata_192.png">
    <img width="100" alt="GoGovMY - Malaysia's open-source link management infrastructure." src="./apps/web/public/_static/logo.png">
    
  </a>
</div>

<h3 align="center">GoGovMY Official Repository </h3>

<p align="center">
    GoGovMY - Malaysia's open-source link management infrastructure.
    <br />
    <a href="https://go.gov.my"><strong>Learn more »</strong></a>
    <br />
    <br />
    <a href="#introduction"><strong>Introduction</strong></a> ·
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#pre-requisites"><strong>Pre-Requisites</strong></a> ·
    <a href="#setup-local-environment-variables"><strong>Setup Local Environment Variables</strong></a> ·
    <a href="#working-directories"><strong>Working Directories</strong></a>
    <a href="#infrastructure-&-application-architecture"><strong>Infrastructure & Application Architecture</strong></a>
    <a href="#local-development"><strong>Local Development</strong></a>
    <a href="#contributing"><strong>Contributing</strong></a>
    <a href="#license"><strong>License</strong></a>
</p>

<br/>

## Introduction

[GoGovMY](https://go.gov.my/) - Malaysia's open-source link management infrastructure.

Welcome to the official repository for GoGovMY, a comprehensive monorepo project meticulously crafted to enhance the development, management, and deployment of a suite of projects that power Malaysian government secure link shortener and analytics platform build by [GovTech Malaysia](https://www.tech.gov.my/).

There are multiple reasons why we built an official government link shortener:

- URLs are too long to fit into tweets or SMSes, and difficult to remember
- Email clients might block other commercial link shorteners if they are listed as spam on their site
- Citizens are afraid of phishing when receiving a shortened link and unsure of where it goes

With GoGovMY, citizens are safe in the knowledge that the links are official and safe. Any authorized user can log in with their government emails and immediately create authenticated and recognisable short links.

## Features

- [Link Analytics](https://go.gov.my/features/analytics)
- [QR Codes](https://go.gov.my/features/qr-codes)
- [Personalization](https://go.gov.my/features/personalization)
- [Team Collaboration](https://go.gov.my/features/collaboration)

## Tech Stack

- [Next.js](https://nextjs.org/) – framework
- [TypeScript](https://www.typescriptlang.org/) – language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Self-Host Redis](https://hub.docker.com/_/redis) – redis
- [PostgresSQL](https://hub.docker.com/_/postgres) – database
- [NextAuth.js](https://next-auth.js.org/) – auth
- [Turborepo](https://turbo.build/repo) – monorepo
- [Amazon Simple Email Services](https://aws.amazon.com/ses/) – emails
- [AWS K8S](https://aws.amazon.com/kubernetes/) – deployments
- [GoLang](https://go.dev/) – Redirect Server
- [Debezium](https://go.dev/) – Database Event Trigger
- [Kafka](https://go.dev/) – Event Streaming
- [ElasticSearch](https://go.dev/) – Indexing & Analytics
- [ZooKeeper](https://go.dev/) – Dependency Management
- [KafDrop](https://go.dev/) – Kafka UI Management
- [Debezium-UI](https://go.dev/) – Debzium UI Management
- [Uptime-Kuma](https://go.dev/) – Status Page

## Pre-Requisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/installation)
- [Turbo](https://turbo.build/docs/installation)
- [AWS Account](https://aws.amazon.com/)
- [Google Cloud Auth](https://cloud.google.com/)

### Setup Local Environment Variables

Please create a `.env` (using as .env.example as example) file in the root directory and add the following environment variables:

```
###############################
###### REQUIRED ENV VARS ######
###############################

NEXT_PUBLIC_APP_NAME=GoGovMy
NEXT_PUBLIC_APP_DOMAIN=gogovmy
NEXT_PUBLIC_APP_SHORT_DOMAIN=app.go.gov.my
NEXT_PUBLIC_APP_APP_DOMAIN=locahost:8888
NODE_ENV=development

# This is for Unit Test in the apps/web/tests folder
E2E_BASE_URL=http://localhost:8888
E2E_TOKEN=
E2E_USER_ID=
E2E_WORKSPACE_ID=
E2E_WORKSPACE_SLUG=
E2E_WORKSPACE_NAME=

REDIS_URL="redis://localhost:6379"
REDIS_PORT=6379

POSTGRESHOST=localhost
POSTGRESDB=gogov-local
POSTGRESUSER=postgres
POSTGRESPASSWORD=postgres
POSTGRESPORT=5432
DATABASE_URL="postgresql://${POSTGRESUSER}:${POSTGRESPASSWORD}@localhost:${POSTGRESPORT}/${POSTGRESDB}?schema=public"
DIRECT_URL="postgresql://${POSTGRESUSER}:${POSTGRESPASSWORD}@localhost:${POSTGRESPORT}/${POSTGRESDB}?schema=public"


# Generate a random secret here: https://generate-secret.vercel.app/32
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:8888 # (only needed for localhost)

# AWS SES - Simple Email Services for OTP
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-2
SES_EMAIL_SOURCE=
## Replae this value with environment base url
BASE_URL=http://localhost:8888

#Logstash Config
ELASTICSEARCH_HOST=http://elasticsearch:9200
LOGSTASH_STATEMENT=""


###############################
###### OPTIONAL ENV VARS ######
###############################

# Used for Google Login
# Learn how to set this up here: https://next-auth.js.org/providers/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Use for storing image assets
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_ENDPOINT=
STORAGE_BASE_URL=

# Redirect Services
KAFKA_OUTBOX_TOPIC=ps-postgres.public.WebhookOutbox
REDIRECT_SERVER_URL=http://localhost:3000
KAFKA_BROKER_URL=localhost:9092

# GoLang ENV
ELASTIC_URL=http://localhost:9200
ELASTIC_USER=elastic
ELASTIC_PASSWORD=
HTTP_PORT=3000
TELEMETRY_URL=jaeger:4318
```

## Working Directories

```
go-gov-my
  |_.github - CI/CD GitHub Actions
  |_ apps
    |_ docs
    |_ web
    |_ redirect-server
  |_connect-jdbc-es
  |_packages
    |_tailwind-config
    |_tsconfig
    |_ui
    |_utils
  |_.dockerignore
  |_.editorconfig
  |_.env.example
  |_.docker-compose.yml
  |_Dockerfile
  |_filebeat.yml
  |_init-debezium-connector.sh
  |_LICENSE.md
  |_package.json
  |_pnpm-lock.yaml
  |_pnpm-workspace.yaml
  |_prettier-config.js
  |_README.md
  |_turbo.json

```

## Infrastructure & Application Architecture

[Figma UI Mockup](https://www.figma.com/file/1)
[Figjam Board](https://www.figma.com/file/1)

```
----- Applications -----
# Application Dashboard: Port 8888
# Administrator Dashbaord: Port 8888 with sub-domain {{admin.localhot:8888}}
# Redirect Server: Port 3000
# Redirect Server API (Internal): Port 3002
# Documentation App: Port 3334

----- Services -----
# Prisma Studio: Port 5555
# Internal Redirect Server API: Port 3002
# ElasticSearch: Port 9200
# Database: Port 5432
# Kafka: Port 9092
# Redis: 6379
# Zookeeper: 2181
# Kafdrop: 9000
# Kafka: 29092
# Debezium: 8083
# Debezium UI: 8080
# Uptime-Kuma: 3001

```

## Local Development

```
## Clone the repository
git clone https://github.com/govtechmy/go-gov-my.git

## CD into directories
cd go-gov-my

## Install dependencies
pnpm install

## Start the development server
docker-compose up -d
pnpm dev
```

## Contributing

We encourage to contribute! Here's how you can contribute:

- [Open an issue](https://github.com/govtechmy/go-gov-my/issues) if you believe you've encountered a bug.
- Follow the [local development guide](https://go.gov.my/docs/local-development) to get your local dev environment set up.
- Make a [pull request](https://github.com/govtechmy/go-gov-my/pull) to add new features/make quality-of-life improvements/fix bugs.

## License

GoGovMY is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. You can [find it here](https://github.com/govtechmy/go-gov-my/blob/main/LICENSE.md).
