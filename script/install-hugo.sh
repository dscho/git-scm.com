#!/bin/sh

die() {
    echo "$*" >&2
    exit 1
}

HUGO_VERSION=$(sed -n 's/^ *hugo_version: *//p' <hugo.yml) &&
test -n "$HUGO_VERSION" ||
die "hugo_version not found in hugo.yml"

echo "Upgrading to Hugo v${HUGO_VERSION}" >&2

download_url=https://github.com/gohugoio/hugo/releases/download &&
curl -Lo /tmp/hugo.deb $download_url/v$HUGO_VERSION/hugo_extended_${HUGO_VERSION}_linux-amd64.deb &&
sudo dpkg -i /tmp/hugo.deb ||
die "Failed to install Hugo version $HUGO_VERSION"