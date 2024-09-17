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

import { Command } from "prosemirror-commands";
import { MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { InputContainer } from "@evolvedbinary/prosemirror-lwdita";
import { unTravel } from "@evolvedbinary/prosemirror-lwdita";
import { JditaSerializer } from "@evolvedbinary/lwdita-xdita";
import { InMemoryTextSimpleOutputStreamCollector } from "@evolvedbinary/lwdita-xdita/dist/stream";

/**
 * Open file selection dialog and select and file to insert into the local storage.
 * @param input - The input element
 * @returns - Command
 */
function openFile(input: InputContainer): Command {
  return (state: { tr: any; selection: { empty: any; }; }, dispatch: (arg0: any) => void) => {
    function fileSelected(this: HTMLInputElement, event: Event) {
      if (input.el?.files?.length === 1) {
        const file = input.el.files[0];
        const fileName = file.name.split('.xml');
        console.log(fileName[0]);
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onerror = () => {
          console.log('an error reading while reading the file');
        };
        reader.onload = () => {
          if (dispatch && typeof reader.result === 'string') {
            localStorage.setItem('file', reader.result);
            localStorage.setItem('fileName', fileName[0]);
            dispatch(state.tr);
            location.reload();
          }
        };
      } else {
        console.log('can not add image:', input.el?.files?.length);
      }
    }
    try {
      if (!state.selection.empty) {
        return false;
      }
      if (dispatch) {
        if (!input.el) {
          console.log('no input found');
          return false;
        }
        input.el.value = '';
        input.on('command', fileSelected);
        return true;
      }
      return true;
    } catch(e) {
      console.info('Error opening file:');
      console.error(e);
      return false;
    }
  }
}

/**
 * Create a menu item to open a file selection dialog to upload a file into the local storage.
 * @returns A MenuElement
 */
export function openFileMenuItem(): MenuElement {
  const input = new InputContainer();
  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file');
      el.classList.add('label');
      input.el = document.createElement('input');
      input.el.type = 'file';
      input.el.id = 'fileUpload';
      input.el.accept = 'application/xml,.xml';
      input.el.title = 'Upload an XDITA file';
      const label = document.createElement('label');
      label.setAttribute('for', 'fileUpload');
      label.innerText = 'Open XDITA file';
      el.appendChild(input.el);
      el.appendChild(label);
      return el;
    },
    class: 'ic-open',
    run: openFile(input),
  });
}

/**
 * Creates a menu item for publishing to Github.
 * This function generates a menu item that allows users to publish a file
 *
 * @returns {MenuElement} The menu item for publishing the file.
 */
export function publishFileMenuItem(): MenuElement {
  //const storedFile = localStorage.getItem('file') ? localStorage.getItem('file') : console.log('No file in the localStorage to save.');
  const storedFileName = localStorage.getItem('fileName') ? localStorage.getItem('fileName') : 'Petal';

  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file', 'publish');
      const link = document.createElement('a');
      link.download = storedFileName + '.xml';
      link.textContent = 'Publish "' + storedFileName + '.xml"';
      link.id = 'publishFile';
      el.appendChild(link);
      return el;
    },
    class: 'ic-github',
    run: publishGithubDocument()
  });
}

/**
 * Creates a command that publishes the current document to GitHub.
 *
 * @returns {Command} A ProseMirror command function.
 */
function publishGithubDocument(): Command {
  return (state: {[x: string]: any; tr: any; selection: { empty: any; };}, dispatch: (arg0: any) => void) => {
    if (dispatch) {
      dispatch(state.tr);
      console.log('Publishing the document to GitHub...');
      //window.location.href = 'https://github.com/login/oauth/authorize?client_id=Iv23li0Pvl3E4crXIBQ0'
      // show the publishing dialog
    } else {
      console.log('Nothing to publish, no EditorState has been dispatched.');
    }
  }
}

/**
 * Create a menu item to save a file to the filesystem
 * @returns A MenuElement
 */
export function saveFileMenuItem(props: Partial<MenuItemSpec & { url: string }> = {}): MenuElement {
  const link = new InputContainer();
  //const storedFile = localStorage.getItem('file') ? localStorage.getItem('file') : console.log('No file in the localStorage to save.');
  const storedFileName = localStorage.getItem('fileName') ? localStorage.getItem('fileName') : 'Petal';

  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file');
      const link = document.createElement('a');
      link.download = storedFileName + '.xml';
      link.textContent = 'Download "' + storedFileName + '.xml"';
      link.id = 'saveFile';
      el.appendChild(link);
      return el;
    },
    class: 'ic-download',
    run: saveFile(link)
  });
}

/**
 * Provide a download facility for the current file in the Prosemirror editor
 * Create a data url for the JDITA object and
 * offer a JSON file download when the element is clicked
 *
 * @param input - The menu item containing the download link
 * @returns The HTML data url
 */
function saveFile(input: InputContainer): Command {
  return (state: {[x: string]: any; tr: any; selection: { empty: any; };}, dispatch: (arg0: any) => void) => {
    if (dispatch) {
      dispatch(state.tr);
      const xditaPrefix = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">\n`;
      const documentNode = transformToJditaDocumentNode(state);
      console.log('Document Node:', documentNode);
      const file = xditaPrefix + documentNode;
      const data = new Blob([file], { type: 'text/plain' });
      const url = window.URL.createObjectURL(data);
      const link = document.getElementById('saveFile');
      if (link) {
        link.setAttribute('href', url);
      } else {
        console.log('The URL could not be assigned to the element, the link is not available.')
      }
      // TODO: Implement a callback function to check if the download has been completed
      // After the load has completed revoke the data URL with `URL.revokeObjectURL(url);`
      // See https://w3c.github.io/FileAPI/#examplesOfCreationRevocation
    } else {
      console.log('Nothing to download, no EditorState has been dispatched.');
    }
  }
}

/**
 * Parse the current Prosemirror Editor state to a JSON object and
 * transform it to a JDITA object
 *
 * @param state - The current editor state
 * @returns The JDITA document node object
 */
function transformToJditaDocumentNode(state: { [x: string]: any; tr?: any; selection?: { empty: any; }; toJSON?: any; }) {
  const prosemirrorJson = state.toJSON();
  // Change the type value from 'type: doc' to expected 'type: document' for JDITA processing
  prosemirrorJson.doc.type = 'document';
  const documentNode = unTravel(prosemirrorJson.doc);
  const outStream = new InMemoryTextSimpleOutputStreamCollector();
  const serializer = new JditaSerializer(outStream, true);

  serializer.serializeFromJdita(documentNode);

  return outStream.getText();
  ;
};

// TODO: Create a new function to transform the JDITA object
// back to XDITA as soon as the JDITA version is updated!
// Call serializeToXML() and pass the documentNode rendered by `transformToJditaDocumentNode()`.

/**
 * Create a menu item to redirect to the github page of the project.
 * @param props - Menu item properties
 * @returns - MenuItem
 */
export function githubMenuItem(props: Partial<MenuItemSpec & { url: string }> = {}): MenuElement {
  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file');
      const icon = document.createElement('span');
      icon.className = 'ic-github';
      icon.style.marginInlineEnd = '0.5em';
      const label = document.createElement('span');
      label.innerHTML = props.label || '';
      const link = document.createElement('a');
      link.href = props.url || '#';
      link.style.textDecoration = 'none';
      link.style.padding = '0 0.5em';
      link.append(icon);
      link.append(label);
      el.appendChild(link);
      return el;
    },
    label: 'See on Github',
    run: () => {},
  });
}
