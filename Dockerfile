FROM axonivy/axonivy-engine:dev

ARG NODE_VERSION=12.18.3
ENV NODE_VERSION $NODE_VERSION

USER root

#Common deps
RUN apt-get update && \
    apt-get -y install build-essential \
                       curl \
                       git \
                       gpg \
                       maven \
                       make \
                       python2 \
                       sudo \
                       wget \
                       xz-utils && \
    rm -rf /var/cache/apt/* && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*

## User account
RUN adduser ivy sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN mkdir /home/ivy && chown ivy:ivy /home/ivy && \
    mkdir /home/project && chown ivy:ivy /home/project

USER ivy

RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN bash -c ". $HOME/.nvm/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    npm install -g yarn"

ENV PATH="/home/ivy/.nvm/versions/node/v$NODE_VERSION/bin:$PATH"

WORKDIR /home/ivy
COPY --chown=ivy:ivy ./lerna.json ./lerna.json
COPY --chown=ivy:ivy ./package.json ./package.json
COPY --chown=ivy:ivy ./yarn.lock ./yarn.lock
COPY --chown=ivy:ivy ./theia-extension/ ./theia-extension/
COPY --chown=ivy:ivy ./browser-app/ ./browser-app/
RUN yarn --cwd theia-extension
RUN yarn --cwd browser-app

ENV THEIA_DEFAULT_PLUGINS="local-dir:/home/ivy/browser-app/plugins"

EXPOSE 3000
ENTRYPOINT [ "node", "/home/ivy/browser-app/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]