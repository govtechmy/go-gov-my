## Introduction

Temporary Readme for our Govtech Development. Later we modify the main Readme to include whatever information we need.

Initially you can use the existing .env provided by the owner but you can also register 3rd party service and use your own API keys/Secrets.

Alternatively you can checkout official documentations. If you're using my own .env then you dont need to setup those account, but you can do it anyway. https://dub.co/docs/local-development

## Pre Requisite

1. Docker Desktop and Docker Account
2. pnpm | https://pnpm.io/
3. Python 3.9.6
4. Pip / Pip3 | https://pypi.org/project/pip/

## Steps

### Root Directory

1. cd into root project directory and run `pnpm i` to install all the dependencies.
2. run `pnpm install -g mintlify`

### Packages Directory

!! Important, to ensure dependencies are installed correctly, follow these steps:

1. cd into `packages`
2. cd into `Tinybird` and run `pip install tinybird-cli || pip3 install tinybird-cli`
3. run `tb-auth` and paste the auth token from .env file
4. run `tb-push`
5. cd `../ui` and run `pnpm i` then try `npm run dev` to see if it's compiled correctly. It shall create .dist folder. Ctrl + C / CMD + C to stop.
6. cd `../utils` and run `pnpm i` then try `npm run dev` to see if it's compiled correctly. It shall create .dist folder. Ctrl + C / CMD + C to stop.

### Web Application

1. cd into `apps/web`
2. Run `pnpm i`
3. Run `docker-compose up` to start the web application.
4. Run `npx prisma generate`
5. Run `npx prisma db push`
6. Then run `pnpm dev`
