import { Command } from "prosemirror-commands";
import { MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { InputContainer } from "prosemirror-jdita";
import { schema } from "prosemirror-jdita";
import { DOMSerializer, Fragment } from "prosemirror-model";
import { unTravel } from "prosemirror-jdita";

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
 * Create a menu item to save a file to the filesystem
 * @returns A MenuElement
 */
export function saveFileMenuItem(props: Partial<MenuItemSpec & { url: string }> = {}): MenuElement {
  const link = new InputContainer();
  //const storedFile = localStorage.getItem('file') ? localStorage.getItem('file') : console.log('No file in the localStorage to save.');
  const storedFileName = localStorage.getItem('fileName') ? localStorage.getItem('fileName') : 'Test_File';

  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file');
      const link = document.createElement('a');
      link.download = storedFileName + '.json';
      link.textContent = 'Download "' + storedFileName + '.json"';
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
      const documentNode = transformToJditaDocumentNode(state);
      const file = JSON.stringify(documentNode);
      const data = new Blob([file], { type: 'application/json' });
      const url = window.URL.createObjectURL(data);
      const link = document.getElementById('saveFile');
      link.setAttribute('href', url);
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
  prosemirrorJson.doc.type = 'document';
  const documentNode = unTravel(prosemirrorJson.doc);
  return documentNode;
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
