#!/bin/bash
set -e

commit=`git describe --always HEAD`

git clone -q -b ${GH_BRANCH} "https://${GH_REF}" dist
shopt -s dotglob
shopt -s extglob
rm -rf dist/!(CNAME|.git|.|..)
shopt -u dotglob
shopt -u extglob

npm install blitzrk/asciidoc-blog
./node_modules/.bin/ablog patch
./node_modules/.bin/ablog build

cd dist
git config user.name "${GH_NAME}"
git config user.email "${GH_EMAIL}"
git add -A
git commit -m "Deploy from commit ${commit}"

git push -q "https://${GH_TOKEN}@${GH_REF}" master:${GH_BRANCH} > /dev/null 2>&1
