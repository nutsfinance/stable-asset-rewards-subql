#!/usr/bin/env sh
set -e
echo "const atob = a => Buffer.from(a, 'base64').toString('binary');" > dist/acalaEvm.js.tmp
echo "const btoa = b => Buffer.from(b).toString('base64');" >> dist/acalaEvm.js.tmp
cat dist/acalaEvm.js >> dist/acalaEvm.js.tmp
mv dist/acalaEvm.js.tmp dist/acalaEvm.js
echo "const atob = a => Buffer.from(a, 'base64').toString('binary');" > dist/index.js.tmp
echo "const btoa = b => Buffer.from(b).toString('base64');" >> dist/index.js.tmp
cat dist/index.js >> dist/index.js.tmp
mv dist/index.js.tmp dist/index.js
