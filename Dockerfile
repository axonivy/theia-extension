ARG NODE_VERSION=12 

FROM node:${NODE_VERSION}-alpine as build
RUN apk add --no-cache make gcc g++ python
WORKDIR /home/theia
COPY ./lerna.json ./lerna.json
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./theia-extension/ ./theia-extension/
COPY ./browser-app/ ./browser-app/
RUN yarn --cwd theia-extension
RUN yarn --cwd browser-app
#RUN yarn --production --cwd browser-app 

FROM axonivy/axonivy-engine:latest

USER root
RUN apt-get update \
    && apt-get -y --fix-broken install \
    && apt-get -y install curl

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh
RUN bash -c ". .nvm/nvm.sh \
    && nvm install 12 \
    && nvm use 12 \
    && npm install -g yarn"

USER ivy