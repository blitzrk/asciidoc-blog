#!/bin/bash
set -euo pipefail
dir="$(dirname $(readlink -f "$0"))"

function usage() {
	>&2 echo "Usage: ablog [server | build]"
	exit 1
}

function main() {
	if [ $# -gt 1 ]; then
		>&2 echo "ablog takes exactly 0 or 1 arguments"
		>&2 echo
		usage
	elif [ $# -eq 0 ]; then
		cmd=build
	else
		cmd="$1"
	fi

	case $cmd in
		"build")
			( cd $dir ; npm run build )
			;;
		"server")
			( cd $dir ; npm start )
			;;
		*)
			usage
			;;
	esac
}

main "$@"
