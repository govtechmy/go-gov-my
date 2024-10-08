#/bin/sh

# Required env variables:
# - MAXMIND_ACCOUNT_ID
# - MAXMIND_LICENSE_KEY
# - MAXMIND_DB_PERMALINK
# - MAXMIND_ASN_DB_PERMALINK
# Get these by signing up for a dev account at https://www.maxmind.com

# Source environment variables from the root project directory if .env exists
if [ -f "../.env" ]; then
  . "../.env"
fi

# Function to check if a variable is set
check_var() {
  if [ -z "${!1}" ]; then
    echo "Error: Environment variable $1 is not set."
    exit 1
  fi
}


# Check required environment variables
check_var MAXMIND_ACCOUNT_ID
check_var MAXMIND_LICENSE_KEY
check_var MAXMIND_DB_PERMALINK
check_var MAXMIND_ASN_DB_PERMALINK

# Downloads
curl -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_DB_PERMALINK" -o maxmind-db.tar.gz

if [ $? -ne 0 ]; then
  echo "Curl command failed."
  exit 1
fi

# Extract
tar -xzf maxmind-db.tar.gz

# Find the extracted folder that starts with GeoLite2-City
extracted_folder=$(ls -d GeoLite2-City*/ | head -n 1)

# Move the DB file
mv "./${extracted_folder}GeoLite2-City.mmdb" ../apps/redirect-server


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
mv "./${asn_folder}GeoLite2-ASN.mmdb" ../apps/redirect-server


# Remove the downloaded and extracted folders 
rm maxmind-db.tar.gz maxmind-asn-db.tar.gz
rm -rf $extracted_folder $asn_folder