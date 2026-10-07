# usage: sheets.sh <srcDir> <prefix> [only-board-names...] ; 6장씩 0.5배 contact sheet
SRC=$1; P=$2; shift 2
C="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=$(cygpath -w "$PWD"); M=$(cygpath -m "$PWD")
if [ $# -gt 0 ]; then ORDER=("$@"); else mapfile -t ORDER < <(node -e "require('../guide/root/project/canvas.json').order.forEach(f=>console.log(f.replace('.dc.html','')))"); fi
mkdir -p sheets; i=0; n=0
while [ $i -lt ${#ORDER[@]} ]; do
  names="${ORDER[@]:$i:6}"; n=$((n+1)); f=$(printf "%s_%02d" $P $n)
  node combine.js $SRC sheets/$f.html sheet 0.5 3 $names
  timeout 90 "$C" --headless=new --disable-gpu --no-first-run --hide-scrollbars "--user-data-dir=$W\\prof" --allow-file-access-from-files --virtual-time-budget=6000 --window-size=1640,1940 "--screenshot=$W\\sheets\\$f.png" "file:///$M/sheets/$f.html" </dev/null >/dev/null 2>&1
  echo "$f: $names"; i=$((i+6))
done
