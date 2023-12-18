# Prosemirror JDita
[![Node.js Version](https://img.shields.io/node/v-lts/prosemirror-jdita)](https://nodejs.org)
[![Npm Package Version](https://img.shields.io/npm/v/prosemirror-jdita)](https://www.npmjs.com/package/prosemirror-jdita)
[![Build Status](https://circleci.com/gh/evolvedbinary/prosemirror-jdita.svg?style=svg)](https://circleci.com/gh/evolvedbinary/prosemirror-jdita)
[![Coverage Status](https://coveralls.io/repos/github/evolvedbinary/prosemirror-jdita/badge.svg?branch=main)](https://coveralls.io/github/evolvedbinary/prosemirror-jdita?branch=main)

This tool generates Prosemirror documents from JDita objects. It also provides Schema Definition for proper display and editing of JDita data.

# Usage
Add the library to your project using npm or yarn

```shell
npm install prosemirror-jdita
```

```shell
yarn add prosemirror-jdita
```

//TODO how to include & usage

# Demo 
We provide a Small demo to showcase features and as playground to test the 

```shell
yarn build:demo # build the demo

yarn start:demo # start the demo 
```

This will start a demo on `http://localhost:1234`

# Development
For development, you will need Node.js and a node package manager, like Yarn, to be installed in your environment.

* Minimal Node version: v12.13.1
* Optional: This project uses Yarn as its build system. Although we don't support it, if you prefer, it should also be possible to use npm instead of Yarn. The version of Yarn that we have used is v1.22.21.

## install dependencies
```shell
yarn install
```

## Build the library

```shell
yarn build
```

## Testing

```shell
yarn test # run unit tests

yarn coverage # get coverage
```

