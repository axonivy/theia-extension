FROM maven:3.6.3-adoptopenjdk-11

ARG NODE_VERSION=12.18.3
ENV NODE_VERSION $NODE_VERSION

USER root

#Common deps
RUN apt-get update && \
    apt-get -y install build-essential \
                       curl \
                       git \
                       gpg \
                       make \
                       zip \
# use python2 for ubuntu 20.04
                       python \
                       sudo \
                       wget \
                       xz-utils && \
    rm -rf /var/cache/apt/* && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*


## User account
RUN useradd --uid 1000 --user-group ivy && \
    mkdir /home/ivy && chown ivy:ivy /home/ivy && \
    adduser ivy sudo && \
    echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    mkdir /home/project && chown ivy:ivy /home/project

ARG IVY_ENGINE_DOWNLOAD_URL=https://developer.axonivy.com/permalink/dev/axonivy-engine.deb
ARG IVY_PACKAGE_NAME=axonivy-engine-9
ARG IVY_HOME=/usr/lib/axonivy-engine
ENV IVY_HOME=/usr/lib/axonivy-engine

RUN wget ${IVY_ENGINE_DOWNLOAD_URL} -O /tmp/${IVY_PACKAGE_NAME}.deb --no-verbose && \
    dpkg --force-all -i /tmp/${IVY_PACKAGE_NAME}.deb && \
    ln -s /usr/lib/${IVY_PACKAGE_NAME} ${IVY_HOME} && \
    ln -s /var/lib/${IVY_PACKAGE_NAME} /var/lib/axonivy-engine && \
    ln -s /etc/${IVY_PACKAGE_NAME} /etc/axonivy-engine && \
    rm -f /tmp/${IVY_PACKAGE_NAME}.deb && \
    rm -rf /usr/share/doc/${IVY_PACKAGE_NAME}

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
COPY --chown=ivy:ivy ./.yarnrc ./.yarnrc
COPY --chown=ivy:ivy ./theia-extension/ ./theia-extension/
COPY --chown=ivy:ivy ./editor-inscriptions/ ./editor-inscriptions/
COPY --chown=ivy:ivy ./browser-app/ ./browser-app/

RUN yarn --cwd theia-extension/ && \
    yarn --cwd editor-inscriptions/ && \
    yarn --cwd browser-app && \
    yarn --production && \
    rm -rf ./.packages-cache && \
    rm -rf ./.cache

ENV THEIA_DEFAULT_PLUGINS="local-dir:/home/ivy/browser-app/plugins"
ENV SHELL=/bin/bash

EXPOSE 3000
ENTRYPOINT [ "node", "/home/ivy/browser-app/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]
