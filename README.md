# theia-extension
The example of how to build the Theia-based applications with the theia-extension.

## Open in Gidpod (eclipse theia based Cloud-IDE)
[![Open in Gitpod ](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/axonivy/ivy-theia-extension/)

## Getting started

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash

Install npm and node.

    nvm install 12
    nvm use 12

Install yarn.

    npm install -g yarn

## Running the browser example

    yarn rebuild:browser
    cd browser-app
    yarn start

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn rebuild:electron
    cd electron-app
    yarn start

## Developing with the browser example

Start watching of theia-extension.

    cd theia-extension
    yarn watch

Start watching of the browser example.

    yarn rebuild:browser
    cd browser-app
    yarn watch

Launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Developing with the Electron example

Start watching of theia-extension.

    cd theia-extension
    yarn watch

Start watching of the electron example.

    yarn rebuild:electron
    cd electron-app
    yarn watch

Launch `Start Electron Backend` configuration from VS code.
