# Prosemirror JDita

[![Node.js Version](https://img.shields.io/node/v-lts/prosemirror-jdita)](https://nodejs.org)
[![Npm Package Version](https://img.shields.io/npm/v/prosemirror-jdita)](https://www.npmjs.com/package/prosemirror-jdita)
[![Build Status](https://circleci.com/gh/evolvedbinary/prosemirror-jdita.svg?style=svg)](https://circleci.com/gh/evolvedbinary/prosemirror-jdita)
[![Coverage Status](https://coveralls.io/repos/github/evolvedbinary/prosemirror-jdita/badge.svg?branch=main)](https://coveralls.io/github/evolvedbinary/prosemirror-jdita?branch=main)

This tool generates Prosemirror documents from JDita objects. It also provides Schema Definition for proper display and editing of JDita data.

## Usage

Add the library to your project using npm or yarn

```shell
npm install prosemirror-jdita
```

```shell
yarn add prosemirror-jdita
```

Include the Library:

```javascript
// SCHEMA builder
import { schema } from "prosemirror-jdita";
//PLUGINS
import { menu, shortcuts } from "prosemirror-jdita";
//Transform library
import { xditaToJson } from "jdita";
import { document } from "prosemirror-jdita";
```

This is a minimal example of how to use Prosemirror-JDita.
You can check the [included demo](prosemirror-jdita-demo/src/) for a full example:

```javascript
// Please use a valid XDita sample,
// e.g. pick one from https://github.com/oasis-tcs/dita-lwdita/tree/spec/org.oasis.xdita/samples/xdita
let xdita = `Insert your XDita example here`

// Transform the XDita to jdita
let jDita = await xditaToJson(xdita,true);
// transform the jdita to Schema compliant Document
let document = await document(jDita);

// create the schema object
const schemaObject = schema();

// build the prosemirror document
const doc = Node.fromJSON(schemaObject, jsonDoc);

// create a new prosemirror state check https://prosemirror.net/docs/ref/#state for more info
const state = EditorState.create({
  doc,
  plugins: [
    shortcuts(schemaObject),
    menu(schemaObject, {}),
  ]
})

//Grab the HTML Dom element to render the editor in
const domEl = document.querySelector("#editor");

// create a new EditorView
new EditorView(domEl, {
  state,
});
```

## Demo

We provide a [small demo](prosemirror-jdita-demo/src/) to showcase features and as a playground to test all of the features.

```shell
# clone project and install dependencies
git clone https://github.com/evolvedbinary/prosemirror-jdita.git
cd prosemirror-jdita
yarn install

# start the demo
yarn start:demo
```

This will start a demo on `http://localhost:1234`.
If this port is already in use, `parcel` will assign a random port that you can see in the terminal logs.

## Development

### Prerequisites

For development, you will need Node.js and a node package manager, like Yarn, to be installed in your environment.

* Minimal Node version: v20.10.0
* Optional: This project uses Yarn as its build system. Although we don't support it, if you prefer, it should also be possible to use npm instead of Yarn. The version of Yarn that we have used is v1.22.21.

### Installation

Clone the Prosemirror-JDita repository:

```shell
git clone https://github.com/evolvedbinary/prosemirror-jdita.git
```

Change to the Prosemirror-JDita directory:

```shell
cd prosemirror-jdita
```

Install all packages:

```shell
yarn install
```

### Build

#### Build the Project

```shell
yarn build
```

#### Build the Demo

```shell
yarn build:demo
```

### Generate the TSDoc Documentation

```shell
yarn run generate-docs
```

This will generate a new folder `docs` containing an HTML file with the entire TSDoc Prosemirror-JDita documentation.
Open this file in a browser to navigate through the documentation.

### Test

This project also has tests which are written using the Mocha framework.
To execute the test suite and view the code coverage, run:

```shell
yarn test # run unit tests

yarn coverage # get coverage
```

## Flow Diagram of Prosemirror-JDita

This diagram demonstrates the library and the internal flow:

![Diagram of the Prosemirror-JDita application flow](diagrams/prosemirror-jdita-app-flow.svg "Diagram of the Prosemirror-JDita application flow")
