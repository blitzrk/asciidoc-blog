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
bash ./run/patch.sh

npm run build
cd dist
git config user.name "${GH_NAME}"
git config user.email "${GH_EMAIL}"
git add .
git commit -m "Deploy from commit ${commit}"

git push -q "https://${GH_TOKEN}@${GH_REF}" master:${GH_BRANCH} > /dev/null 2>&1
