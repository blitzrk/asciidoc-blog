#!/bin/bash
set -e

if ! git remote | grep -q ^fork$; then
	git remote add fork https://github.com/blitzrk/asciidoc-blog.git
fi

git pull --squash fork master
git commit -m "Update asciidoc-blog"
