#!/bin/bash
set -euo pipefail
dir=`dirname "$(readlink -f "$0")"`

function get_file() {
	find "$dir/../.." -name index.js -type f \
		| grep 'css/lib/parse'
}

function needs_patching() {
	file="$1"
	line=`sed '583q;d' "$file"`
	[[ "$line" != "if (typeof obj !== 'string') {" ]]
}

function do_patch() {
	file="$1"

	sed -i "582a\\
if (typeof obj !== 'string') {\\
" "$file"

	sed -i "591a\\
}\\
" "$file"
}

function main() {
	file="$(get_file)"

	if needs_patching "$file"; then
		do_patch "$file"
	fi
}

main
