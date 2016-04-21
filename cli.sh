#!/bin/bash
set -euo pipefail
dir="$(dirname $(readlink -f "$0"))"
own="$(pwd)"

function usage() {
	>&2 echo "Usage: ablog [COMMAND]"
	>&2 echo
	>&2 echo "Commands:"
	>&2 echo "  init"
	>&2 echo "  update"
	>&2 echo "  build [default]"
	>&2 echo "  server"
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
		cmd="$1"; shift
	fi

	case $cmd in
		"init")
			if [ ! -d "$own/run" ]; then
				cp "$dir/config.json" "$own"
				cp "$dir/.travis.yml" "$own"
				cp -a "$dir/run"      "$own"
				mkdir -p "$own/_assets/sass"
				cp -a "$dir/_assets/static" "$own/_assets"
				( cd "$own" ; ./run/patch.sh )
			fi
			;;
		"update")
			[ ! -d "$own/run" ] && "$0" init
			( cd "$own"
			  npm update "$(grep '_from' package.json | \
				 sed -r 's/^.*: "([^@"]+).*$/\1/')"
			)
			;;
		"build")
			if [ ! -e "$own/config.json" ]; then
				>&2 echo "ablog needs a config.json file to run"
				>&2 echo
				usage
			fi
			( cd $dir ; npm run build -- -c="$own/dist" )
			;;
		"server")
			if [ ! -e "$own/config.json" ]; then
				>&2 echo "ablog needs a config.json file to run"
				>&2 echo
				usage
			fi
			( cd $dir ; npm start -- -c="$own/dist" )
			;;
		*)
			usage
			;;
	esac
}

main "$@"
