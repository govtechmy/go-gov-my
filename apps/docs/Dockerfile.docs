FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install @mintlify/cli

RUN npm install -g mintlify

COPY . .

EXPOSE 3334

CMD ["mintlify", "dev", "--port", "3334"]

