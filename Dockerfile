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
                       make \
                       python2 \
                       sudo \
                       wget \
                       xz-utils && \
    rm -rf /var/cache/apt/* && \
    rm -rf /var/lib/apt/lists/*

#Maven (https://github.com/carlossg/docker-maven/blob/26ba49149787c85b9c51222b47c00879b2a0afde/openjdk-11/Dockerfile)
ARG MAVEN_VERSION=3.6.3
ARG SHA=c35a1803a6e70a126e80b2b3ae33eed961f83ed74d18fcd16909b2d44d7dada3203f1ffe726c17ef8dcca2dcaa9fca676987befeadc9b9f759967a8cb77181c0
ARG BASE_URL=https://apache.osuosl.org/maven/maven-3/${MAVEN_VERSION}/binaries

RUN mkdir -p /usr/share/maven /usr/share/maven/ref \
  && curl -fsSL -o /tmp/apache-maven.tar.gz ${BASE_URL}/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
  && echo "${SHA}  /tmp/apache-maven.tar.gz" | sha512sum -c - \
  && tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
  && rm -f /tmp/apache-maven.tar.gz \
  && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

ENV MAVEN_HOME /usr/share/maven

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

RUN yarn --cwd theia-extension --cache-folder ./ycache && \
    yarn --cwd browser-app --cache-folder ./ycache && \
    rm -rf ./ycache

ENV THEIA_DEFAULT_PLUGINS="local-dir:/home/ivy/browser-app/plugins"

EXPOSE 3000
ENTRYPOINT [ "node", "/home/ivy/browser-app/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]