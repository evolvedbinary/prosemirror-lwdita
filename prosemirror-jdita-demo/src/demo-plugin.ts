import { Command } from "prosemirror-commands";
import { MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { InputContainer } from "prosemirror-jdita";

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
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onerror = () => {
          console.log('an error reading while reading the file');
        };
        reader.onload = () => {
          if (dispatch && typeof reader.result === 'string') {
            localStorage.setItem('file', reader.result);
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
      input.el.title = 'Open XDITA file';
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
 * Create a menu item to open a file selection dialog to upload a file into the local storage.
 * @returns A MenuElement
 */
export function saveFileMenuItem(): MenuElement {
  const input = new InputContainer();
  return new MenuItem({
    enable: () => true,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-file');
      el.classList.add('label');
      input.el = document.createElement('input');
      input.el.type = 'button';
      input.el.id = 'saveFile';
      input.el.value = 'Download File';
      input.el.title = 'Save and download the edited XDITA file';
      const label = document.createElement('label');
      label.setAttribute('for', 'saveFile');
      label.innerText = 'Download File';
      el.appendChild(input.el);
      el.appendChild(label);
      return el;
    },
    class: 'ic-download',
    run: openFile(input),
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
