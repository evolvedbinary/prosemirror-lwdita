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

import { AbstractBaseNode, ChildTypes, DocumentNode, MapNode, UnknownNodeError, getNodeClass, getNodeClassType, nodeGroups } from '@evolvedbinary/lwdita-ast';
import { getDomNode } from './dom';
import { NodeSpec, Schema, SchemaSpec, Node, MarkSpec, DOMOutputSpec, Attrs } from 'prosemirror-model';
import { lwditaNodeNameToSchemaNodeName } from './utils';


/**
 * Referenced schema: https://github.com/oasis-tcs/dita-lwdita/tree/spec/org.oasis.xdita/dtd
 */

/**
 * Set the root node `document` to string "doc"
 *
 * @remarks
 * Will be used in `defaultNodeName()`.
 */
export const NODE_NAMES: Record<string, string> = {
  block_document: 'doc',
}

/**
 * Provide a map of special (media) nodes to their corresponding DOM node
 */
export const TO_DOM: Record<string, (node: typeof AbstractBaseNode, attrs: Attrs)
  => (node: Node) => DOMOutputSpec> = {}

/**
 * Some nodes have special attributes.
 * This List allows to add special attributes to the node if it's not 
 * in the schema and render them in the DOM
 */
export const NODE_ATTRS: Record<string, (attrs: string[]) => Attrs> = {
  video: node => defaultNodeAttrs([...node, 'poster', 'title']),
  audio: node => defaultNodeAttrs([...node, 'title']),
  image: node => defaultNodeAttrs([...node, 'alt'])
}

/**
 * A map of attributes for special nodes and their
 * corresponding attribute names in the Prosemirror DOM
 *
 * @privateRemarks
 * TODO: autoplay, controls, loop, muted are boolean attributes in XDITA, but they don't require a value in HTML5.
 * As soon as they are rendered in the DOM, browsers will render them as true, even if they have a value "false".
 * This needs to be fixed where handling the attribute values:
 * If attribute value === false, then prefix it with a `data-j-*` attribute.
 */
export const NODE_ATTR_NAMES: Record<string, Record<string, string>> = {
  video: {
    _: '*',
    autoplay: 'autoplay',
    controls: 'controls',
    loop: 'loop',
    muted: 'muted',
    tabindex: 'tabindex',
    height: 'height',
    width: 'width',
    poster: 'poster',
    parent: '*',
    outputclass: 'class',
  },
  audio: {
    _: '*',
    autoplay: 'autoplay',
    controls: 'controls',
    loop: 'loop',
    muted: 'muted',
    tabindex: 'tabindex',
    keyref: 'src',
    parent: '*',
    outputclass: 'class',
  },
  'media-source': {
    href: 'src',
    format: 'type',
  },
  'media-track': {
    kind: 'kind',
    href: 'src',
    srclang: 'srclang',
  },
  xref: {
    keyref: 'href',
    href: 'href',
  },
  image: {
    _: '*',
    href: 'src',
    alt: 'alt',
    width: 'width',
    height: 'height',
    scope: '*',
    parent: '*',
    outputclass: 'class',
  },
}

/**
 * Provide a map of special nodes to their corresponding Schema
 */
export const SCHEMAS: Record<string, (node: typeof AbstractBaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (): SchemaNode => {
    const result: SchemaNode = {
      attrs: {
        parent: { default: '' }
      },
    };
    return result;
  },
}

// /**
//  * The LwDITA Schema. Describes parent-child relationships.
//  * content: The allowed child elements of the element
//  * groups: The content-groups, the element is allowed to be part of
//  */
// export const SCHEMA_CONTENT: Record<string, [content: string, groups: string]> = {
// /*
//   lwdita-ast node groups:
//   'ph': ['b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u'],
//   'inline.noimage': ['text', 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u', 'xref'],
//   'inline.noxref': ['text', 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u', 'image'],
//   'inline': ['text', 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u', 'image', 'xref'],
//   'simple_blocks': ['p', 'ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'note'],
//   'fn-blocks': ['p', 'ul', 'ol', 'dl'],
//   'all-blocks': ['p','ul','ol','dl','pre','audio','video','example','simpletable','fig','note'],
//   'list-blocks': ['p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note'],
//   'fig-blocks': ['p', 'ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable'],
//   'example-blocks': ['p','ul','ol','dl','pre','audio','video','simpletable','fig','note'],
//   'fallback-blocks': ['image','alt','p','ul','ol','dl','pre','note'],
//  */
//   alt: ['(text|ph)*', 'fallback_blocks'],
//   audio: ['desc? fallback? media_source* media_track*', 'simple_blocks all_blocks list_blocks fig_blocks example_blocks'],
//   body: ['list_blocks* section* div?', ''],
//   dd: ['list_blocks*', ''],
//   desc: ['inline_noxref*', ''],
//   div: ['fn+', ''],
//   dl: ['dlentry+', 'simple_blocks fn_blocks all_blocks list_blocks fig_blocks example_blocks fallback_blocks'],
//   dlentry: ['dt dd', ''],
//   dt: ['inline*', ''],
//   document: ['topic', ''],
//   fallback: ['fallback_blocks', ''],
//   em: ['inline_noimage*', 'ph '],
//   example: ['title? example_blocks*', 'simple_blocks all_blocks list_blocks fig_blocks'],
//   fig: ['title? desc? (fig_blocks|image|xref)*', 'all_blocks list_blocks example_blocks'],
//   fn: ['fn_blocks*', ''],
//   image: ['alt?', 'inline_noxref inline fallback_blocks'],
//   keydef: ['topicmeta?', ''],
//   keytext: ['(text|ph)*', ''],
//   li: ['list_blocks*', ''],
//   map: ['(topicmeta? (topicref|keydef)*)', ''],
//   'media-source': ['', ''],
//   'media-track': ['', ''],
//   metadata: ['othermeta*', ''],
//   navtitle: ['(text|ph)*', ''],
//   note: ['simple_blocks*', 'simple_blocks all_blocks list_blocks example_blocks fallback_blocks'],
//   ol: ['li+', 'simple_blocks fn_blocks all_blocks list_blocks fig_blocks example_blocks fallback_blocks'],
//   othermeta: ['', ''],
//   p: ['inline*', 'fn_blocks simple_blocks fig_blocks list_blocks all_blocks'],
//   ph: ['inline*', 'ph inline_noimage inline_noxref inline'],
//   pre: ['(text|ph|xref)*', 'simple_blocks all_blocks list_blocks fig_blocks example_blocks fallback_blocks'],
//   prolog: ['metadata*', ''],
//   section: ['title? all_blocks*', ''],
//   simpletable: ['title? sthead? strow+', ' all_blocks list_blocks fig_blocks example_blocks'],
//   shortdesc: ['inline*', ''],
//   stentry: ['simple_blocks*', ''],
//   sthead: ['stentry+', ''],
//   strong: ['inline_noimage*', ''],
//   strow: ['(stentry*)', ''],
//   title: ['inline_noxref*', ''],
//   topic: ['title shortdesc? prolog? body?', ''],
//   topicmeta: ['navtitle? keytext? othermeta*', ''],
//   topicref: ['topicmeta? topicref*', ''],
//   tt: ['inline_noimage*', ''],
//   ul: ['li+', 'simple_blocks fn_blocks  all_blocks list_blocks fig_blocks example_blocks fallback_blocks'],
//   video: ['desc? fallback? video_poster? media_source* media_track*', 'simple_blocks all_blocks list_blocks fig_blocks example_blocks'],
//   'video-poster': ['', ''],
//   xref: ['inline_noxref', 'inline_noimage inline'],
// }

/**
 * A map of special children for certain media nodes
 */
// export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {
//   video: () => ['desc', 'fallback', 'video-poster', 'media-source', 'media-track' ],
//   audio: () => ['desc', 'fallback', 'media-source', 'media-track' ],
// }

/**
 * The inline markup elements bold, italic, underline, subscript, superscript
 */
export const IS_MARK = ['b', 'i', 'u', 'sub', 'sup', 'cdata'];

/**
 * A representation of a node in the schema
 */
export interface SchemaNode {
  inline?: boolean;
  content?: string;
  group?: string;
  domNodeName?: string;
  attrs?: Record<string, { default: string }>;
}

/**
 * `SchemaNodes` is a map of nodes in the schema
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
function getChildren(type: ChildTypes): {name: string, required: boolean, single: boolean, group?: string}[] {
  if (Array.isArray(type)) {
    const childTypes = type.map(getChildren).flat();
    return childTypes;
  }

  if(type.isGroup) {
    return nodeGroups[type.name].map(child => ({
      name: child,
      required: type.required,
      single: type.single,
      group: type.name
    }));
  } else {
    return [{
      name: type.name,
      required: type.required,
      single: type.single,
    }];
  }
}


/**
 * Travel the node and generate the node spec
 *
 * @param node - JDita node
 * @param next - Next travel function
 * @returns SchemaNode
 */
function schemaTravel(node: typeof AbstractBaseNode, next: (nodeName: string) => void): SchemaNode {
  return (SCHEMAS[node.nodeName] || defaultTravel)(node, next);
}

/**
 * Returns a function that generates the dom spec for a node
 *
 * @see {@link https://prosemirror.net/docs/ref/#model.DOMOutputSpec} for more info
 *
 * @param node - JDita node
 * @param attrs - The attributes of the node
 * @returns A function that generates the DOM spec
 */
export function defaultToDom(node: typeof AbstractBaseNode, attrs: Attrs): (node: Node) => DOMOutputSpec {
  return function(pmNode: Node) {
    return [getDomNode(node.nodeName, pmNode.attrs?.parent), attrs
      ? Object.keys(attrs).reduce((newAttrs, attr) => {
        if (pmNode.attrs[attr]) {
          const domAttr = getDomAttr(node.nodeName, attr);
          newAttrs[domAttr] = pmNode.attrs[attr];
        }
        return newAttrs;
      }, { 'data-j-type': node.nodeName } as Record<string, string>)
    : {}, 0];
  }
}

/**
 * Returns the dom attribute name
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
export function defaultNodeAttrs(attrs: string[]): Attrs {
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
  node: typeof AbstractBaseNode,
  next: (nodeName: string, parent: typeof AbstractBaseNode) => void): NodeSpec {
  
  const children = getChildren(node.childTypes);
  // const isNode = IS_MARK.indexOf(node.nodeName) < 0;
  // const [content, _group] = isNode ? SCHEMA_CONTENT[node.nodeName] : [undefined, undefined];
  const attrs = (NODE_ATTRS[node.nodeName] || defaultNodeAttrs)(['parent', ...node.fields]);

  // create the node spec
  const result: NodeSpec = {
    attrs,
    // group,
    toDOM: (TO_DOM[node.nodeName] || defaultToDom)(node, attrs),
  };

  const parentAllowsMixedContent = checkIsInline(node);
  result.content = generateContent(children, parentAllowsMixedContent);

  children.forEach(child => next(child.name, node));
  return result;
}

function generateContent(children: { name: string, required: boolean, single: boolean, group?: string }[], parentAllowsMixedContent: boolean) {
  let content = "";
  for (let idx = 0; idx < children.length; idx++) {
    const child = children[idx]
    // remove the marks
    if(IS_MARK.includes(child.name)) continue;
    
    if (child.group) {
      const groupName = child.group;
      const groupChildren = children.filter(child => !IS_MARK.includes(child.name)).filter(child => child.group === groupName);
      content += `(`
      for (const groupChild of groupChildren) {
        content += `${lwditaNodeNameToSchemaNodeName(groupChild.name, parentAllowsMixedContent)}|`
      }
      content = content.substring(0, content.length - 1);
      content += `)`;
      if (child.required) {
        if (!child.single) {
          content += "+";
        }
      } else {
        if (child.single) {
          content += "?";
        } else {
          content += "*";
        }
      }

      content += " "
      idx += children.filter(child => child.group === groupName).length - 1;
    } else {
      content += nameAndCardinality(child, parentAllowsMixedContent)
      content += " "
    }
  }
  return content.trim();
}

function nameAndCardinality(child: { name: string, required: boolean, single: boolean }, parentAllowsMixedContent: boolean): string {
  let name = defaultNodeName(child.name);
  name = lwditaNodeNameToSchemaNodeName(name, parentAllowsMixedContent);
  if(child.required) {
    if(!child.single) {
      name += "+";
    }
  } else {
    if(child.single) {
      name += "?";
    } else {
      name += "*";
    }
  }

  return name;
}


const checkIsInline = (node: typeof AbstractBaseNode): boolean => {
  if(node.nodeName === 'document') {
    return false;
  }
  const nodeClass = getNodeClass(node.nodeName);
  const nodeInstance = new nodeClass({});
  return nodeInstance.allowsMixedContent();
};

/**
 * Transforms the node `nodeName`
 * by replacing dashes with underscores
 *
 * @remarks
 * defaultNodeName will return all nodeNames retrieved by `schema()`
 * and document()
 *
 * @example
 * `media-track` will be transformed to `media_track`
 *
 * @param nodeName - The name of the node
 * @returns A string with the transformed node name
 */
export function defaultNodeName(nodeName: string): string {
  return NODE_NAMES[nodeName] || nodeName.replace(/-/g, '_');
}

/**
 * Creates a schema for the prosemirror editor
 * based on the jdita nodes
 *
 * @see {@link https://prosemirror.net/docs/ref/#model.SchemaSpec}.
 *
 * @returns The Schema Object, describing a schema, as passed to the Schema constructor
 */
export function schema(): Schema {
  const done: string[] = [];

  // the schema spec are the nodes and marks
  const spec: SchemaSpec = {
    // the node types in this schema
    nodes: {
      text: {
        inline: true,
      },
    },
    // the mark types that exist in this schema
    marks: {},
  }

  // populate the schema spec using the jdita nodes
  function browse(node: string | typeof AbstractBaseNode, parent: typeof AbstractBaseNode): void {
    // get the node name
    let nodeName = typeof node === 'string' ? node : node.nodeName;

    const parentAllowsMixedContent = checkIsInline(parent);
    nodeName = lwditaNodeNameToSchemaNodeName(nodeName, parentAllowsMixedContent);

    // if we have already processed this node then there's no need to process it again
    if (done.indexOf(nodeName) > -1) {
      return;
    }
    // add the node to the list of done nodes
    done.push(nodeName);

    // do not process the alt or text nodes
    if (['text', 'cdata'].indexOf(node as string) > -1) {
      return;
    }

    try {
      const nodeClass = typeof node === 'string' ? getNodeClassType(node) : node;
      // travel the node class and generate the node spec
      const result = defaultTravel(nodeClass, browse);
      result.inline = checkIsInline(parent);
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
        console.error(e);
      } else {
        console.error(node);
        console.error(e);
      }
    }
  }

  // start the process of populating the schema spec using the jdita nodes from the document node
  browse(DocumentNode, DocumentNode);
  browse(MapNode, MapNode);

  // (spec.nodes as NodeSpec).block_topic.content = 'title shortdesc? prolog? body?';
  // (spec.nodes as NodeSpec).doc.content = 'topic';

  return new Schema(spec);
}

//Escape hatch for Unit Testing due to a lack of “package-private” accessibility scope in TypeScript
export const _test_private_schema = {
  getChildren,
  schemaTravel,
}