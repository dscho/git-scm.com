#!/bin/sh

die() {
    echo "$*" >&2
    exit 1
}

case "$MSYSTEM" in
MINGW64)
	suffix=_windows-amd64.zip
	update() {
		unzip -d $HOME/bin /tmp/hugo$suffix hugo.exe
	}
	;;
*)
	suffix=_linux-amd64.deb
	update() {
		sudo dpkg -i /tmp/hugo$suffix
	}
	;;
esac

HUGO_VERSION=$(sed -n 's/^ *hugo_version: *//p' <hugo.yml) &&
test -n "$HUGO_VERSION" ||
die "hugo_version not found in hugo.yml"

echo "Upgrading to Hugo v${HUGO_VERSION}" >&2

download_url=https://github.com/gohugoio/hugo/releases/download &&
curl -Lo /tmp/hugo$suffix $download_url/v$HUGO_VERSION/hugo_extended_${HUGO_VERSION}${suffix} &&
update ||
die "Failed to install Hugo version $HUGO_VERSION"
