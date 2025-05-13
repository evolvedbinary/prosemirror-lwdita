/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { history } from "prosemirror-history";
import jsonDocLoader from "./doc";
import { githubMenuItem, openFileMenuItem, publishFileMenuItem, saveFileMenuItem } from "./demo-plugin";
import {
  Config,
  parseConfig,
  hasConfirmedNotification,
  schema,
  showWelcomeNote,
  menu,
  shortcuts,
  doubleClickImagePlugin,
  processRequest,
  fetchAndTransform,
  URLParams,
  Json
} from "@evolvedbinary/prosemirror-lwdita";
import { createLocalization } from "@evolvedbinary/prosemirror-lwdita-localization";

//load the localization 
const localization = createLocalization();
//load the schema
const schemaObject = schema();


async function loadConfig(url: string): Promise<Config> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorMessage = "Unable to download JSON config " + url + ": " + response.statusText
    console.error(errorMessage);
    throw new Error(errorMessage);
  } else {
    const configJson = await response.text();
    return parseConfig(configJson);
  }
}

// Entry point for the script
async function entryPoint() {


  // show the welcome note
  if (!hasConfirmedNotification()) {
    showWelcomeNote(localization);
  }
  // load the config file
  const config = await loadConfig("config.json");

  /**
  * Process the URL parameters
  */
  const urlParams = processRequest(config, localization) as URLParams | undefined;

  let loadJsonDoc = jsonDocLoader;
  // if the URL parameters are present, fetch the document from GitHub
  if(urlParams) {
    loadJsonDoc = fetchAndTransform(config, urlParams);
  }

  // render the prosemirror document
  const jsonDoc = await loadJsonDoc;
  renderProsemirrorDocument(jsonDoc, urlParams, config);
}

function renderProsemirrorDocument(jsonDoc: Record<string, Json>, urlParams: URLParams | undefined, config: Config) {
  // get the editor element from the DOM
  const domEl = document.querySelector("#editor") as HTMLElement;
  // clear the element innerHTML
  domEl.innerHTML = '';
  // if the element exists, create a new EditorView
  if (domEl) {
    // take in the schema and the json document
    const doc = Node.fromJSON(schemaObject, jsonDoc);
    // create a new EditorState with the doc and the plugins
    const state = EditorState.create({
      doc,
      plugins: [
        // history plugin comes from prosemirror-history
        history(),
        // these were custom plugins check the prosemirror-lwdita/src/plugin.ts file
        shortcuts(localization, schemaObject),
        menu(localization, schemaObject, {
          end: [[
            githubMenuItem({ label: 'lwdita', url: 'https://github.com/evolvedbinary/lwdita' }),
            githubMenuItem({ label: 'prosemirror-lwdita', url: 'https://github.com/evolvedbinary/prosemirror-lwdita' }),
          ]],
          start: [[
            urlParams? publishFileMenuItem(config, localization, urlParams) : openFileMenuItem(localization),
            saveFileMenuItem(urlParams, localization)
          ]],
        }),
        doubleClickImagePlugin(localization)
      ]
    })
    // create a new EditorView with the dom element and the state
    new EditorView(domEl, {
      state,
    });
  }

  // TODO handled the case where we can not render the editor
}

// call the entryPoint function
entryPoint().then(() => {
  console.log("Editor loaded");
}).catch((error) => {
  console.error("Error loading editor", error);
});
