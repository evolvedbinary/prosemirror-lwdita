import { BaseNode, getNodeClassType, UnknownNodeError, DocumentNode, nodeGroups, customChildTypesToString } from 'jdita';
import { getDomNode } from './dom';
import { ChildTypes } from 'jdita';
import { NodeSpec, Schema, SchemaSpec, Node, MarkSpec, DOMOutputSpec } from 'prosemirror-model';

// TODO: This constant usage is not clear
export const NODE_NAMES: Record<string, string> = {
  document: 'doc',
}

// TODO: Why is this is empty?
export const TO_DOM: Record<string, (node: typeof BaseNode, attrs: any)
  => (node: Node) => DOMOutputSpec> = {}

/**
 * Some nodes have special attributes.
 * This is a list of those nodes and their special attributes
 */
export const NODE_ATTRS: Record<string, (attrs: string[]) => any> = {
  video: node => defaultNodeAttrs([...node, 'controls', 'autoplay', 'loop', 'muted', 'poster']),
  audio: node => defaultNodeAttrs([...node, 'controls', 'autoplay', 'loop', 'muted']),
}

/**
 * `NODE_ATTR_NAMES` is a map of attributes for special nodes
 */
export const NODE_ATTR_NAMES: Record<string, Record<string, string>> = {
  video: {
    _: '*',
    autoplay: '*',
    controls: '*',
  },
  'media-source': {
    value: 'src',
  },
  xref: {
    keyref: 'href',
  },
  image: {
    _: '*',
    href: 'src',
  },
}
/**
 * TODO: This constant is not used anywhere and it's not clear what it does
 */
export const SCHEMAS: Record<string, (node: typeof BaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode => {
    const result: SchemaNode = {
      attrs: {
        parent: { default: '' }
      },
    };
    return result;
  },
}

/**
 * `SCHEMA_CONTENT` is the LwDita schema
 * it's being used to get nodes allowed children
 */
export const SCHEMA_CONTENT: Record<string, [content: string, groups: string]> = {
  audio: ['desc? media_source* media_track*', 'simple_blocks fig_blocks list_blocks all_blocks'],
  body: ['list_blocks* section* fn*', ''],
  data: ['(text|data)*', 'common_inline all_inline fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
  dd: ['list_blocks*', ''],
  desc: ['common_inline*', ''],
  dl: ['dlentry+', 'fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
  dlentry: ['dt dd', ''],
  dt: ['all_inline*', ''],
  document: ['topic', ''],
  fig: ['title? desc? (fig_blocks|image|xref)*', 'list_blocks all_blocks'],
  fn: ['fn_blocks*', 'simple_blocks all_blocks'],
  image: ['', 'common_inline all_inline'],
  'media-source': ['', ''],
  'media-track': ['', ''],
  li: ['list_blocks*', ''],
  note: ['simple_blocks*', 'simple_blocks list_blocks all_blocks'],
  ol: ['li+', 'fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
  p: ['all_inline*', 'fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
  ph: ['all_inline*', 'common_inline all_inline'],
  pre: ['(text|ph|xref|data)*', 'simple_blocks fig_blocks list_blocks all_blocks'],
  prolog: ['data*', ''],
  section: ['title? all_blocks*', ''],
  simpletable: ['sthead? strow+', 'fig_blocks list_blocks all_blocks'],
  shortdesc: ['all_inline*', ''],
  stentry: ['simple_blocks*', ''],
  sthead: ['stentry+', ''],
  strow: ['(stentry*)', ''],
  title: ['common_inline*', ''],
  topic: ['title shortdesc? prolog? body?', ''],
  ul: ['li+', 'fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
  video: ['desc? media_source* media_track*', 'simple_blocks fig_blocks list_blocks all_blocks'],
  xref: ['common_inline*', 'all_inline'],
}

/**
 * `SCHEMA_CHILDREN` is a map of special children for certain media nodes
 */
export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {
  video: type => ['media-source', 'media-track', 'desc'],
  audio: type => ['media-source', 'media-track', 'desc'],
}

/**
 * `IS_MARK` is containing an array of inline markup
 * bold, italic, underline, subscript, superscript
 */
export const IS_MARK = ['b', 'i', 'u', 'sub', 'sup'];

/**
 * `SchemaNode` is a representation of a node in the schema
 */
export interface SchemaNode {
  inline?: boolean;
  content?: string;
  group?: string;
  domNodeName?: string;
  attrs?: Record<string, { default: string }>;
}

/**
 * TODO
 */
export interface SchemaNodes {
  [key: string]: SchemaNode;
}

/**
 * Get node children
 *
 * @param type - Type of the Child nodes
 * @returns - The children of the node
 */
function getChildren(type: ChildTypes): string[] {
  if (Array.isArray(type)) {
    return type.map(subType => getChildren(subType)).reduce((result, children) =>
    result.concat(children.filter(child => result.indexOf(child) < 0)), [] as string[]);
  }
  return (type.isGroup ? nodeGroups[type.name] : [ type.name ]);
}

/**
 * TODO: This function is not used anywhere
 */
export function travel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  return (SCHEMAS[node.nodeName] || defaultTravel)(node, next);
}

/**
 * `defaultToDom` returns a function that generates the dom spec for a node
 *
 * @see {@link https://prosemirror.net/docs/ref/#model.DOMOutputSpec} for more info
 *
 * @param node - JDita node
 * @param attrs - The attributes of the node
 * @returns A function that generates the DOM spec
 */
export function defaultToDom(node: typeof BaseNode, attrs: any): (node: Node) => DOMOutputSpec {
  return function(pmNode: Node) {
    return [getDomNode(node.nodeName, pmNode.attrs?.parent), attrs
      ? Object.keys(attrs).reduce((newAttrs, attr) => {
        if (pmNode.attrs[attr]) {
          const domAttr = getDomAttr(node.nodeName, attr);
          newAttrs[domAttr] = pmNode.attrs[attr];
        }
        return newAttrs;
      }, { 'data-j-type': node.nodeName } as any)
    : {}, 0];
  }
}

/**
 * `getDomAttr` returns the dom attribute name
 *
 * @param nodeName - The name of the node
 * @param attr - The name of the attribute
 * @returns The DOM attribute
 */
export function getDomAttr(nodeName: string, attr: string): string {
  return NODE_ATTR_NAMES[nodeName]
    ? NODE_ATTR_NAMES[nodeName]._
      ? NODE_ATTR_NAMES[nodeName][attr]
        ? NODE_ATTR_NAMES[nodeName][attr] === '*' ? 'data-j-' + attr : NODE_ATTR_NAMES[nodeName][attr]
        : attr
      : NODE_ATTR_NAMES[nodeName][attr] ? NODE_ATTR_NAMES[nodeName][attr] : 'data-j-' + attr
    : 'data-j-' + attr;
}

/**
 * Create default node attributes
 *
 * @param attrs - The attributes of the node
 * @returns A map of the attributes with default values
 */
export function defaultNodeAttrs(attrs: string[]): any {
  return attrs.reduce((result, field) => {
    result[field] = { default: '' };
    return result;
  }, {} as Record<string, { default: string }>);
}

/**
 * Travel the node and generate the node spec
 *
 * @remarks
 * NodeSpec is a description of a node type, used when defining a schema.
 * @see {@link https://prosemirror.net/docs/ref/#model.NodeSpec} for more info
 *
 * @param nodeName - The name of the node
 * @param parent - The parent of the node
 * @param next - Next travel function
 * @returns NodeSpec
 */
function defaultTravel(
  node: typeof BaseNode,
  parent: typeof BaseNode,
  next: (nodeName: string, parent: typeof BaseNode) => void): NodeSpec {
  // get the children of the node
  const children = (SCHEMA_CHILDREN[node.nodeName] || getChildren)(node.childTypes);
  // make the distinction between a node and a mark
  const isNode = IS_MARK.indexOf(node.nodeName) < 0;
  // get the content and group of the node
  const [content, group] = isNode ? SCHEMA_CONTENT[node.nodeName] : [undefined, undefined];
  // get the attributes of the node
  const attrs = (NODE_ATTRS[node.nodeName] || defaultNodeAttrs)(['parent', ...node.fields]);
  // create the node spec
  const result: NodeSpec = {
    attrs,
    inline: !(typeof group === 'string' && (group.indexOf('block') > -1 || group === '')),
    group,
    parseDom: [{
      tag: '[data-j-type=' + node.nodeName + ']',
      getAttrs(dom: HTMLElement) {
        return attrs
          ? Object.keys(attrs).reduce((newAttrs, attr) => {
            const domAttr = getDomAttr(node.nodeName, attr);
            if (dom.hasAttribute(domAttr)) {
              newAttrs[attr] = dom.getAttribute(domAttr);
            }
            return newAttrs;
          }, {} as any)
          : {}
      },
    }],
    toDOM: (TO_DOM[node.nodeName] || defaultToDom)(node, attrs),
  };
  if (typeof content === 'string') {
    result.content = content;
  }
  result.inline = true;
  children.forEach(child => next(child, node));
  return result;
}

/**
 * `defaultNodeName` transforms the node `nodeName`
 * by replacing dashes with underscores
 * @param nodeName - The name of the node
 * @returns A string with the transformed node name
 */
export function defaultNodeName(nodeName: string): string {
  return NODE_NAMES[nodeName] || nodeName.replace(/-/g, '_');
}

/**
 * `schema` creates a schema for the prosemirror editor
 * based on the jdita nodes
 *
 * @see {@link https://prosemirror.net/docs/ref/#model.SchemaSpec}.
 *
 * @returns Schema Object
 */
export function schema(): Schema {
  const done: string[] = [];
  // the schema spec are the nodes and marks
  const spec: SchemaSpec = {
    nodes: {
      text: {
        group: 'common_inline all_inline',
        inline: true,
      },
    },
    marks: {},
  }
  // populate the schema spec using the jdita nodes
  function browse(node: string | typeof BaseNode, parent: typeof BaseNode): void {
    // get the node name
    const nodeName = typeof node === 'string' ? node : node.nodeName;
    // if we have already processed this node then there's no need to process it again
    if (done.indexOf(nodeName) > -1) {
      return;
    }
    // add the node to the list of done nodes
    done.push(nodeName);
    // do not process the alt or text nodes
    // TODO: Shouldn't this be done using the node name?
    if (['alt', 'text'].indexOf(node as string) > -1) {
      return;
    }
    try {
      // get the class of the node
      const NodeClass = typeof node === 'string' ? getNodeClassType(node) : node;
      // travel the node class and generate the node spec
      const result = defaultTravel(NodeClass, parent, browse);
      if (result) {
        // set the node spec based on the node type
        if (IS_MARK.indexOf(nodeName) > -1) {
          (spec.marks as Record<string, MarkSpec>)[defaultNodeName(nodeName)] = result as MarkSpec;
        } else {
          (spec.nodes as Record<string, NodeSpec>)[defaultNodeName(nodeName)] = result;
        }
      }
    } catch (e) {
      if (e instanceof UnknownNodeError) {
      } else {
        console.error(node);
        console.error(e);
      }
    }
  }

  // TODO: calling browse() on the document node!!
  // TODO: Document node is a class not an instance
  browse(DocumentNode, DocumentNode);
  // set the content of the topic and doc nodes
  (spec.nodes as any).topic.content = 'title shortdesc? prolog? body?';
  (spec.nodes as any).doc.content = 'topic+';
  // build the new schema and return it
  return new Schema(spec);
}