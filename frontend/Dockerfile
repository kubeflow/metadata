FROM node:12.3.1 as build

ARG COMMIT_HASH
ARG DATE

WORKDIR /frontend

COPY . .

RUN npm install && npm rebuild node-sass && \
  npm run postinstall && \
  if [ "$(uname -m)" = "x86_64" ]; then \
      CI=true npm run test:coverage; \
  fi && \
  npm run build

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
