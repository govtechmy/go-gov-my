# Use the official Node.js image as a base
FROM node:20.11.1

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install root dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Set working directory to apps/web and install dependencies
WORKDIR /usr/src/app/packages/tailwind-config
RUN pnpm install

# Return to the root working directory
WORKDIR /usr/src/app

# Set working directory to apps/web and install dependencies
WORKDIR /usr/src/app/packages/ui
RUN pnpm install

# Return to the root working directory
WORKDIR /usr/src/app

# Set working directory to apps/web and install dependencies
WORKDIR /usr/src/app/packages/utils
RUN pnpm install

# Return to the root working directory
WORKDIR /usr/src/app

# Build the custom packages
RUN pnpm --filter @dub/tailwind-config run build
RUN pnpm --filter @dub/utils run build
RUN pnpm --filter @dub/ui run build

# Build the custom packages
RUN pnpm build

EXPOSE 8888 3334

COPY wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

CMD ["./wait-for-it.sh", "ps-postgres:5432", "--", "./wait-for-it.sh", "redis:6379", "--", "pnpm", "dev"]