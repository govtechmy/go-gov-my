#/bin/sh

# Required env variables:
# - MAXMIND_ACCOUNT_ID
# - MAXMIND_LICENSE_KEY
# - MAXMIND_DB_PERMALINK
# Get these by signing up for a dev account at https://www.maxmind.com

# Download and extract
curl -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_DB_PERMALINK" -o maxmind-db.tar.gz
tar -xzf maxmind-db.tar.gz

# Find the extracted folder that starts with GeoLite2-City
extracted_folder=$(ls -d GeoLite2-City*/ | head -n 1)

# Move the DB file
mv "./${extracted_folder}GeoLite2-City.mmdb" ./apps/redirect-server

# Remove the downloaded and extracted folders 
rm maxmind-db.tar.gz
rm -rf $extracted_folder