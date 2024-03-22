# https://docs.npmjs.com/docker-and-private-modules
FROM node:20-alpine

ENV APP_HOME="/app"
WORKDIR ${APP_HOME}

COPY package*.json ${APP_HOME}/
COPY --chmod=0755 entrypoint.sh /

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
RUN npm install -g yo@4.3.1
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install -g @dilgerma/generator-nebulit-spring-boot
RUN chmod -R g+rwx ${APP_HOME}
ENTRYPOINT /entrypoint.sh
