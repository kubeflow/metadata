FROM node:12.3.1 as build

ARG COMMIT_HASH
ARG DATE

WORKDIR /frontend

COPY . .

# Workaround for ppc64le since phantomjs does not support ppc64le
RUN if [ "$(uname -m)" = "ppc64le" ]; then \
  wget -O /tmp/phantomjs-2.1.1-linux-ppc64.tar.bz2 https://github.com/ibmsoe/phantomjs/releases/download/2.1.1/phantomjs-2.1.1-linux-ppc64.tar.bz2 \
  && tar xf /tmp/phantomjs-2.1.1-linux-ppc64.tar.bz2 -C /usr/local/ \
  && ln -s /usr/local/phantomjs-2.1.1-linux-ppc64/bin/phantomjs /usr/bin/phantomjs; \
  fi

RUN npm install && npm run postinstall && npm run build

# Write commit and build date files and generate the dependency licenses files
# (one for the UI and one for the webserver), concatenate them to one file
# under ./src/server
RUN mkdir -p ./server/dist && \
  echo ${COMMIT_HASH} > ./server/dist/COMMIT_HASH && \
  echo ${DATE} > ./server/dist/BUILD_DATE && \
  node gen_licenses . && \
  node gen_licenses server && \
  cat dependency-licenses.txt >> server/dependency-licenses.txt && \
  npm prune --production

FROM node:12.3.1-alpine

COPY --from=build /frontend/server /server
COPY --from=build /frontend/build /client

WORKDIR /server

EXPOSE 3000
RUN npm run build && npm prune --production
ENV API_SERVER_ADDRESS http://localhost:8080
CMD node dist/server.js ../client/ 3000
