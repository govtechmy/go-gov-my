#!/bin/bash

# Build the Next.js landing page
npm run generate

# Define paths
BASE_DIR=../../redirect-server
TEMPLATES_FOLDER=$BASE_DIR/templates/landing

# Remove existing landing folder if it exists
rm -rf $TEMPLATES_FOLDER

# Create new landing folder
mkdir -p $TEMPLATES_FOLDER

# Copy the built files to the landing folder
cp -r ./out/* $TEMPLATES_FOLDER

# Replace paths in HTML files
find $TEMPLATES_FOLDER -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec sed -i '' -e 's/\/_next/\/public\/landing/g' {} +

# Create public/landing folder and copy static assets
PUBLIC_LANDING_FOLDER=$BASE_DIR/public/landing
mkdir -p $PUBLIC_LANDING_FOLDER
cp -r ./out/_next/static $PUBLIC_LANDING_FOLDER

echo "Landing page built and copied to templates/landing and public/landing folders."