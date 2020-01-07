#!/usr/bin/env bash
rm -rf ./node_modules/
npm uninstall --save "frontend"
npm install
# NOTE: This should have already been linked by going to /path/to/frontend and running `npm link`
npm link "frontend"
