#!/usr/bin/env sh

set -e
npm run build
cd src/dist
echo > .nojekyll

git init
git checkout -B main
git add -A
git commit -m 'deploy'

git push -f git@github.com:annaindistress/frontend-mentor-todo-app.git main:gh-pages

cd -
