npm run build

find out -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.txt" \) -exec sed -i '' -e 's/__goapp_public__/public\/redirect/g' {} +
find out -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.txt" \) -exec sed -i '' -e 's/\/_next/\/public\/redirect/g' {} +

BASE_DIR=../../redirect-server
PUBLIC_FOLDER=$BASE_DIR/public/redirect
TEMPLATES_FOLDER=$BASE_DIR/templates/redirect

cp -r ./out/__goapp_public__/* $PUBLIC_FOLDER
cp -r ./out/_next/static $PUBLIC_FOLDER
cp ./out/*.txt $PUBLIC_FOLDER
cp ./out/favicon.ico $PUBLIC_FOLDER
cp ./out/*.html $TEMPLATES_FOLDER
