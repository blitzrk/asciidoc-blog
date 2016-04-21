#!/bin/bash
set -euo pipefail
dir="$(dirname $(readlink -f "$0"))"
own="$(pwd)"

function usage() {
	>&2 echo "Usage: ablog [COMMAND]"
	>&2 echo
	>&2 echo "Commands:"
	>&2 echo "  init"
	>&2 echo "  build [default]"
	>&2 echo "  server"
	>&2 echo "  patch"
	>&2 echo "  update"
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
			if [ ! -e "$own/config.json" ]; then
				cp -n "$dir/config.json" "$own"
				cp -n "$dir/.travis.yml" "$own"
				cp -an "$dir/_posts"     "$own"
				cp -an "$dir/run"        "$own"
				mkdir -p "$dir/_assets/sass"
				mkdir -p "$dir/_assets/static"
				cp -n "$dir"/_assets/sass/default/* "$own/_assets/sass"
				cp -an "$dir/_assets/static"        "$own/_assets"
				"$0" patch
			fi
			;;
		"patch")
			( cd "$dir" ; "$dir/run/patch.sh" )
			;;
		"update")
			if [[ "$dir" != "${dir//$(npm prefix -g)}" ]]; then
				global=-g
			fi
			npm install ${global-} "$(grep '_from' "$dir/package.json" | \
				sed -r 's/^.*: "([^@"]+).*$/\1/')"
			"$0" patch
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
