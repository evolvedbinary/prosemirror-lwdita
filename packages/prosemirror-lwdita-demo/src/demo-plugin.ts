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
import * as config from "@evolvedbinary/prosemirror-lwdita/app-config.json";
import { InputContainer, renderPrDialog } from "@evolvedbinary/prosemirror-lwdita";
import { unTravel, URLParams } from "@evolvedbinary/prosemirror-lwdita";
import { JditaSerializer } from "@evolvedbinary/lwdita-xdita";
import { InMemoryTextSimpleOutputStreamCollector } from "@evolvedbinary/lwdita-xdita/dist/stream";
import { showToast } from '@evolvedbinary/prosemirror-lwdita';
import { EditorState, Transaction } from "prosemirror-state";

/**
 * Open file selection dialog and select and file to insert into the local storage.
 * @param input - The input element
 * @returns The command for opening a file
 */
function openFile(input: InputContainer): Command {
  return (state: EditorState, dispatch: (arg0: Transaction) => void) => {
    function fileSelected(this: HTMLInputElement, _event: Event) {
      if (input.el?.files?.length === 1) {
        const file = input.el.files[0];
        const fileName = file.name.split('.xml');
        console.log(fileName[0]);
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onerror = () => {
          showToast(config.messageKeys.error.toastFileUploadInvalid, 'error');
          console.log('Error reading file');
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
        showToast(config.messageKeys.error.toastFileUpload, 'error');
      }
    }
    try {
      if (!state.selection.empty) {
        return false;
      }
      if (dispatch) {
        if (!input.el) {
          showToast(config.messageKeys.error.toastFileUploadNoInput, 'error');
          console.log('no input found');
          return false;
        }
        input.el.value = '';
        input.on('command', fileSelected);
        return true;
      }
      return true;
    } catch (e) {
      showToast(config.messageKeys.error.toastFileUpload, 'error');
      console.error(e);
      return false;
    }
  }
}

/**
 * Create a menu item to open a file selection dialog to upload a file into the local storage.
 * @returns The menu element for opening the file menu
 */
export function openFileMenuItem(): MenuElement {
  const input = new InputContainer();
  return new MenuItem({
    enable: () => true,
    render(_editorView) {
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
 * @returns The menu element for publishing the file.
 */
export function publishFileMenuItem(urlParams: URLParams): MenuElement {
  const storedFileName = localStorage.getItem('fileName') ? localStorage.getItem('fileName') : 'Petal';

  return new MenuItem({
    enable: () => true,
    render(_editorView) {
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
    run: publishGithubDocument(urlParams)
  });
}

/**
 * Creates a command that publishes the current document to GitHub.
 *
 * @returns The command to publish a GitHub document
 */
function publishGithubDocument(urlParams: URLParams): Command {
  return (state: EditorState, dispatch: (arg0: Transaction) => void) => {
    if (dispatch) {
      dispatch(state.tr);
      const xditaPrefix = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">\n`;
      const documentNode = transformToJditaDocumentNode(state);
      const updatedXdita = xditaPrefix + documentNode;

      // show the publishing dialog
      renderPrDialog(urlParams.ghrepo, urlParams.source, urlParams.branch, updatedXdita);
    } else {
      showToast(config.messageKeys.error.toastGitHubPublishNoEditorState, 'error');
      console.log('Nothing to publish, no EditorState has been dispatched.');
    }
  }
}

/**
 * Create a menu item to save a file to the filesystem
 * @returns The save file menu element
 */
export function saveFileMenuItem(_props: Partial<MenuItemSpec & { url: string }> = {}): MenuElement {
  const link = new InputContainer();
  const storedFileName = localStorage.getItem('fileName') ? localStorage.getItem('fileName') : 'Petal';

  return new MenuItem({
    enable: () => true,
    render(_editorView) {
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
function saveFile(_input: InputContainer): Command {
  return (state: EditorState, dispatch: (arg0: Transaction) => void) => {
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
        showToast(config.messageKeys.error.toastFileDownload, 'error');
        console.log('The URL could not be assigned to the element, the link is not available.')
      }
      // TODO: Implement a callback function to check if the download has been completed
      // After the load has completed revoke the data URL with `URL.revokeObjectURL(url);`
      // See https://w3c.github.io/FileAPI/#examplesOfCreationRevocation
    } else {
      showToast(config.messageKeys.error.toastFileDownload, 'error');
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
function transformToJditaDocumentNode(state: EditorState): string {
  const prosemirrorJson = state.toJSON();
  // Change the type value from 'type: doc' to expected 'type: document' for JDITA processing
  prosemirrorJson.doc.type = 'document';
  const documentNode = unTravel(prosemirrorJson.doc);
  const outStream = new InMemoryTextSimpleOutputStreamCollector();
  const serializer = new JditaSerializer(outStream, true);

  serializer.serializeFromJdita(documentNode);

  return outStream.getText();

}

/**
 * Create a menu item to redirect to the github page of the project.
 * @param props - Menu item properties
 * @returns The menu item for GitHub
 */
export function githubMenuItem(props: Partial<MenuItemSpec & { url: string }> = {}): MenuElement {
  return new MenuItem({
    enable: () => true,
    render(_editorView) {
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
