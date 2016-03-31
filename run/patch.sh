#!/bin/bash

find ./node_modules -name index.js -type f | grep 'css/lib/parse' | xargs -n 1 sed -i "582a\\
if (typeof obj !== 'string') {\\
"
find ./node_modules -name index.js -type f | grep 'css/lib/parse' | xargs -n 1 sed -i "591a\\
}\\
"
