#!/bin/zsh
# usage: wb.sh name url  -> fetch latest Wayback 200 capture <= 20261024
name=$1; url=$2
ts=$(curl -sS -m 40 "https://web.archive.org/cdx/search/cdx?url=${url#https://}&filter=statuscode:200&limit=-1&to=20261024&fl=timestamp" | tail -1 | tr -d '\r\n ')
[ -z "$ts" ] && { echo "$name NO-CAPTURE"; exit 1; }
loc="https://web.archive.org/web/${ts}id_/$url"
curl -sS -m 60 -L --compressed -o raw/$name.html -w "$name %{http_code} %{size_download} " "$loc"
echo "$loc" > raw/$name.loc
python3 -I scripts/totext.py raw/$name.html text/$name.txt
