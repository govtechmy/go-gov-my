#!/bin/sh

# Required env variables:
# - MAXMIND_ACCOUNT_ID
# - MAXMIND_LICENSE_KEY
# - MAXMIND_CITY_DB_PERMALINK
# - MAXMIND_ASN_DB_PERMALINK
# Get these by signing up for a dev account at https://www.maxmind.com

if [ -z "${MAXMIND_ACCOUNT_ID}" ]; then
  echo "Error: Environment variable MAXMIND_ACCOUNT_ID is not set."
  exit 1
fi
if [ -z "${MAXMIND_LICENSE_KEY}" ]; then
  echo "Error: Environment variable MAXMIND_LICENSE_KEY is not set."
  exit 1
fi
if [ -z "${MAXMIND_CITY_DB_PERMALINK}" ]; then
  echo "Error: Environment variable MAXMIND_CITY_DB_PERMALINK is not set."
  exit 1
fi
if [ -z "${MAXMIND_ASN_DB_PERMALINK}" ]; then
  echo "Error: Environment variable MAXMIND_ASN_DB_PERMALINK is not set."
  exit 1
fi

# Download City database
curl -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_CITY_DB_PERMALINK" -o maxmind-city-db.tar.gz

if [ $? -ne 0 ]; then
  echo "Curl command for City database failed."
  exit 1
fi

# Extract City database
tar -xzf maxmind-city-db.tar.gz

# Find the extracted folder that starts with GeoLite2-City
city_folder=$(ls -d GeoLite2-City*/ | head -n 1)

# Move the City DB file
mv "./${city_folder}GeoLite2-City.mmdb" ./apps/redirect-server

# Download ASN database
curl -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_ASN_DB_PERMALINK" -o maxmind-asn-db.tar.gz

if [ $? -ne 0 ]; then
  echo "Curl command for ASN database failed."
  exit 1
fi

# Extract ASN database
tar -xzf maxmind-asn-db.tar.gz

# Find the extracted folder that starts with GeoLite2-ASN
asn_folder=$(ls -d GeoLite2-ASN*/ | head -n 1)

# Move the ASN DB file
mv "./${asn_folder}GeoLite2-ASN.mmdb" ./apps/redirect-server

# Remove the downloaded and extracted folders 
rm maxmind-city-db.tar.gz maxmind-asn-db.tar.gz
rm -rf $city_folder $asn_folder