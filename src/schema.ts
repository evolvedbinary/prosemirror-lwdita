// import { Schema } from 'prosemirror-model';
import { BaseNode, getNodeClassType, UnknownNodeError, DocumentNode, nodeGroups, customChildTypesToString } from 'jdita';
import { getDomNode } from './dom';
import { ChildTypes } from 'jdita';
import { Schema } from 'prosemirror-model';


export const NODE_NAMES: Record<string, string> = {
  document: 'doc',
}
export const SCHEMAS: Record<string, (node: typeof BaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode => {
    const result: SchemaNode = {
      domNodeName: 'span',
      attrs: {},
    };
    return result;
  }
}
export const SCHEMA_CONTENT: Record<string, (type: ChildTypes, getNodeName?: (nodeName: string) => string) => string> = {
  image: type => '',
}
export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {}

export interface SchemaNode {
  inline?: boolean;
  content?: string;
  group?: string;
  domNodeName?: string;
  attrs?: Record<string, { default: string }>;
}
export interface SchemaNodes {
  [key: string]: SchemaNode;
}

function getChildren(type: ChildTypes): string[] {
  if (Array.isArray(type)) {
    return type.map(subType => getChildren(subType)).reduce((result, children) =>
    result.concat(children.filter(child => result.indexOf(child) < 0)), [] as string[]);
  }
  return (type.isGroup ? nodeGroups[type.name] : [ type.name ]);
}

export function travel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  return (SCHEMAS[node.nodeName] || defaultTravel)(node, next);
}

function defaultTravel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  const children = (SCHEMA_CHILDREN[node.nodeName] || getChildren)(node.childTypes);
  const content = (SCHEMA_CONTENT[node.nodeName] || customChildTypesToString)(node.childTypes, defaultNodeName);
  const domNodeName = getDomNode(node.nodeName);
  const attrs= node.fields.reduce((attrs, field) => {
    attrs[field] = { default: '' };
    return attrs;
  }, {} as Record<string, { default: string }>);
  const result: any = {
    domNodeName,
    attrs,
    parseDom: [{
      tag: domNodeName + '[data-type=' + node.nodeName + ']',
      getAttrs(dom: any) {
        return attrs
          ? Object.keys(attrs).reduce((newAttrs, attr) => {
            if (dom.hasAttribute('data-jdita-' + attr)) {
              newAttrs[attr] = dom.getAttribute('data-jdita-' + attr);
            }
            return newAttrs;
          }, {} as any)
          : {}
      },
    }],
    toDOM(node: any) {
      return [domNodeName, attrs
        ? Object.keys(attrs).reduce((newAttrs, attr) => {
          if (node.attrs[attr]) {
            newAttrs['data-jdita-' + attr] = node.attrs[attr];
          }
          return newAttrs;
        }, { 'data-type': node.nodeName } as any)
      : {}, 0];
    }
  };
  if (content.length) {
    result.content = content;
  }
  if (node.inline) {
    result.inline = true;
  }
  result.inline = true;
  children.forEach(next);
  return result;
}

function defaultNodeName(nodeName: string): string {
  return NODE_NAMES[nodeName] || nodeName.replace(/-/g, '_');
}

export function schema(): Schema {
  const done: string[] = [];
  const nodes: any = {
    text: {},
    'text_node': {
      domNodeName: 'span',
      content: 'text*',
    },
  };
  function browse(node: string | typeof BaseNode): void {
    const nodeName = typeof node === 'string' ? node : node.nodeName;
    if (done.indexOf(nodeName) > -1) {
      return;
    }
    done.push(nodeName);
    if (['alt', 'text'].indexOf(node as string) > -1) {
      return;
    }
    try {
      const NodeClass = typeof node === 'string' ? getNodeClassType(node) : node;
      const result = defaultTravel(NodeClass, browse);
      if (result) {
        nodes[defaultNodeName(nodeName)] = result;
      }
    } catch (e) {
      if (e instanceof UnknownNodeError) {
      } else {
        console.error(node);
        console.error(e);
      }
    }
  }

  browse(DocumentNode);
  return new Schema({ nodes });
}