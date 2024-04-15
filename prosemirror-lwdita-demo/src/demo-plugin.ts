import { Command } from "prosemirror-commands";
import { MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { InputContainer } from "@evolvedbinary/prosemirror-lwdita";
import { schema } from "prosemirror-jdita";
import { DOMSerializer, Fragment } from "prosemirror-model";

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
 * TODO
 *
 * @param input - TODO
 * @returns TODO
 */
function saveFile(input: InputContainer): Command {
  return (state: {[x: string]: any; tr: any; selection: { empty: any; };}, dispatch: (arg0: any) => void) => {
    if (dispatch) {
      dispatch(state.tr);
      //console.log('Transaction Object=', state.tr);
      const updatedDoc = state.doc;
      //console.log('PM Node object=', updatedDoc);
      //console.log('Prosemirror Deserialized DOM = ', state.doc.toString());
      const file = getCurrentProsemirrorDom(updatedDoc);
      console.log('file content=',file);
      const data = new Blob([file], {type: 'text/plain'});
      const url = window.URL.createObjectURL(data);
      //const dl_link = document.getElementById('saveFile').href = url;
    }
  }
}

/**
 * TODO
 *
 * @param doc - TODO
 * @returns TODO
 */
function getCurrentProsemirrorDom(doc: { content: Fragment; }) {
  const schemaObject = schema();
  const pmDOM = document.createElement("div")
  pmDOM.appendChild(DOMSerializer.fromSchema(schemaObject).serializeFragment(doc.content));
  //console.log('PM DOM =', test.innerHTML);
  return pmDOM.innerHTML;
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
      link.href = props.url || '#';
      link.download = storedFileName + '.txt';
      link.id = 'saveFile';
      link.textContent = 'Download "' + storedFileName + '.txt"';
      el.appendChild(link);
      return el;
    },
    class: 'ic-download',
    run: saveFile(link)
  });
}



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
