cd ../apps/redirect-app

npm run build

find out -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.txt" \) -exec sed -i '' -e 's/__goapp_public__/public\/redirect/g' {} +
find out -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.txt" \) -exec sed -i '' -e 's/\/_next/\/public\/redirect/g' {} +

BASE_DIR=../../redirect-server
PUBLIC_FOLDER=$BASE_DIR/public/redirect
TEMPLATES_FOLDER=$BASE_DIR/templates/redirect

rm -rf $PUBLIC_FOLDER
rm -rf $TEMPLATES_FOLDER

mkdir -p $PUBLIC_FOLDER
mkdir -p $TEMPLATES_FOLDER

# public assets
cp -r ./out/__goapp_public__/* $PUBLIC_FOLDER
cp -r ./out/_next/static $PUBLIC_FOLDER
cp ./out/favicon.ico $PUBLIC_FOLDER
cp ./out/404.html $TEMPLATES_FOLDER

# next page: '/' (i.e. /en-GB.html, /ms-MY.html)
cp ./out/en-GB.txt $PUBLIC_FOLDER
cp ./out/ms-MY.txt $PUBLIC_FOLDER
cp ./out/en-GB.html $TEMPLATES_FOLDER
cp ./out/ms-MY.html $TEMPLATES_FOLDER

# create folders for sub-path pages
mkdir -p $PUBLIC_FOLDER/en-GB
mkdir -p $PUBLIC_FOLDER/ms-MY
mkdir -p $TEMPLATES_FOLDER/en-GB
mkdir -p $TEMPLATES_FOLDER/ms-MY

# next page: /secure
cp -r ./out/en-GB/secure.txt $PUBLIC_FOLDER/en-GB
cp -r ./out/ms-MY/secure.txt $PUBLIC_FOLDER/ms-MY
cp -r ./out/en-GB/secure.html $TEMPLATES_FOLDER/en-GB
cp -r ./out/ms-MY/secure.html $TEMPLATES_FOLDER/ms-MY 

# next page: /not-found
cp -r ./out/en-GB/not-found.txt $PUBLIC_FOLDER/en-GB
cp -r ./out/ms-MY/not-found.txt $PUBLIC_FOLDER/ms-MY
cp -r ./out/en-GB/not-found.html $TEMPLATES_FOLDER/en-GB
cp -r ./out/ms-MY/not-found.html $TEMPLATES_FOLDER/ms-MY 

# next page: /error
cp -r ./out/en-GB/error.txt $PUBLIC_FOLDER/en-GB
cp -r ./out/ms-MY/error.txt $PUBLIC_FOLDER/ms-MY
cp -r ./out/en-GB/error.html $TEMPLATES_FOLDER/en-GB
cp -r ./out/ms-MY/error.html $TEMPLATES_FOLDER/ms-MY 

# next page: /expiry
cp -r ./out/en-GB/expiry.txt $PUBLIC_FOLDER/en-GB
cp -r ./out/ms-MY/expiry.txt $PUBLIC_FOLDER/ms-MY
cp -r ./out/en-GB/expiry.html $TEMPLATES_FOLDER/en-GB
cp -r ./out/ms-MY/expiry.html $TEMPLATES_FOLDER/ms-MY 
