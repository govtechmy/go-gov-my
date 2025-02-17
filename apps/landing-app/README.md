<div align="center">
  <a href="https://go.gov.my">
  <img width="100" alt="GoGovMY - Malaysia's open-source link management infrastructure." src="./apps/web/public/_static/jata_192.png">
    <img width="100" alt="GoGovMY - Malaysia's open-source link management infrastructure." src="./apps/web/public/_static/logo.png">
    
  </a>
</div>

<h3 align="center">GoGovMy Landing app </h3>

### Setup Local Environment Variables

Please create a `.env` (using as .env.example as example) file in the root directory and add the following environment variables:

```
API_SECRET_KEY=
APP_URL=
LANDING_STATS_JSON_URL=
ALLOWED_ORIGINS=
NEXT_PUBLIC_APP_DOMAIN=
LAST_UPDATED=
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_LANDING_DOMAIN=
```

## Local Development

```
## Clone the repository
git clone https://github.com/govtechmy/go-gov-my.git

## CD into directories
cd go-gov-my

## CD into landing app repo
cd apps/landing-app

## Install dependencies
npm i

## Start the development server
npm run dev
```

Alternatively you can go to root directory and 

```
## Install dependencies
pnpm install

## Start the development server
docker-compose up -d
pnpm dev

## Open landing-app
localhost:3335
```

