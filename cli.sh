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
			# Copy default styles and other assets
			mkdir -p "$dir/_assets/sass"
			cp -n "$dir"/_assets/sass/default/* "$own/_assets/sass/"
			[ ! -d "$own/_assets/static" ] && cp -r "$dir/_assets/static" "$own/_assets/"

			# Copy default config
			cp -n "$dir/config.json" "$own"
			cp -n "$dir/.travis.yml" "$own"
			[ ! -d "$own/run" ] && cp -r "$dir/_run"   "$own"

			# Copy example posts
			[ ! -d "$own/_posts" ] && cp -r "$dir/_posts" "$own"

			# Patch if needed
			"$0" patch
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
