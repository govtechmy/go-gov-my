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
WORKDIR /usr/src/app/apps/web
RUN pnpm install

# Return to the root working directory
WORKDIR /usr/src/app

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
RUN pnpm --filter @gogovmy/tailwind-config run build
RUN pnpm --filter @gogovmy/utils run build
RUN pnpm --filter @gogovmy/ui run build

# Build the main application
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "dev"]
