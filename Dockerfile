ARG NODE_VERSION=12.18.3

FROM node:${NODE_VERSION}-alpine as build
RUN apk add --no-cache make gcc g++ python
WORKDIR /home/ivy
COPY ./lerna.json ./lerna.json
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./theia-extension/ ./theia-extension/
COPY ./browser-app/ ./browser-app/
RUN yarn --cwd theia-extension
RUN yarn --cwd browser-app
#RUN yarn --production --cwd browser-app 

FROM axonivy/axonivy-engine:dev

USER root
RUN apt-get update \
    && apt-get -y install python2 \
    && apt-get -y install gcc \
    && apt-get -y install g++ \
    && apt-get -y install libc6-dev

RUN mkdir /home/ivy && chown ivy:ivy /home/ivy
RUN mkdir /home/project && chown ivy:ivy /home/project
USER ivy

RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN bash -c ". $HOME/.nvm/nvm.sh \
    && nvm install 12 \
    && nvm use 12 \
    && npm install -g yarn"


ENV PATH="/home/ivy/.nvm/versions/node/v12.18.3/bin:$PATH"

#COPY --from=build --chown=ivy:ivy /home/ivy /home/ivy

USER root
RUN apt-get update \
    && apt-get -y install musl-dev

RUN ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

USER ivy
WORKDIR /home/ivy
COPY ./lerna.json ./lerna.json
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./theia-extension/ ./theia-extension/
COPY ./browser-app/ ./browser-app/
RUN yarn --cwd theia-extension
RUN yarn --cwd browser-app





#ENV SHELL=/bin/bash \
#   THEIA_DEFAULT_PLUGINS=local-dir:/home/ivy/browser-app/plugins

EXPOSE 3000
ENTRYPOINT []
#ENTRYPOINT [ "/home/ivy/.nvm/versions/node/v12.18.3/bin/node", "/home/ivy/browser-app/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]