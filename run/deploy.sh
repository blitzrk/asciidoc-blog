#!/bin/bash
set -e

commit=`git describe --always HEAD`

git clone -q -b ${GH_BRANCH} "https://${GH_REF}" dist
shopt -s dotglob
shopt -s extglob
rm -rf dist/!(CNAME|.git|.|..)
shopt -u dotglob
shopt -u extglob

npm install

#patch reworkcss/css
find ./node_modules -name index.js -type f | grep 'css/lib/parse' | xargs -n 1 sed -i "582a\\
if (typeof obj !== 'string') {\\
"
find ./node_modules -name index.js -type f | grep 'css/lib/parse' | xargs -n 1 sed -i "591a\\
}\\
"

npm run build
cd dist
git config user.name "${GH_NAME}"
git config user.email "${GH_EMAIL}"
git add .
git commit -m "Deploy from commit ${commit}"

git push -q "https://${GH_TOKEN}@${GH_REF}" master:${GH_BRANCH} > /dev/null 2>&1
