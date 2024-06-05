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

/**
 * DOM nodes mapping from JDITA to HTML
 */
export const DOM_NODES: Record<string, string | ((parent?: string) => string)> = {
  audio: 'audio',
  body: 'div',
  b: 'strong',
  data: 'data',
  desc: parent => parent === 'fig' ? 'figcaption' : 'caption',
  dd: 'dd',
  dl: 'dl',
  document: 'doc',
  dt: 'dt',
  dlentry: 'div',
  fig: 'figure',
  fn: 'span',
  i: 'em',
  image: 'img',
  'media-source': 'source',
  'media-track': 'track',
  li: 'li',
  note: 'div',
  ol: 'ol',
  p: 'p',
  ph: 'span',
  pre: 'pre',
  prolog: 'p',
  section: 'section',
  shortdesc: 'p',
  simpletable: 'table',
  stentry: 'td',
  sthead: 'thead',
  strow: 'tr',
  sub: 'sub',
  sup: 'sup',
  title: parent => parent === 'section' ? 'h2' : 'h1',
  topic: 'article',
  u: 'u',
  ul: 'ul',
  video: 'video',
  xref: 'a',
}

/**
 * Get the HTML node name for a JDITA node
 *
 * @param node - JDITA node name
 * @param parent - JDITA parent node name
 * @returns HTML node name
 */
export function getDomNode(node: string, parent?: string): string {
  const domName = DOM_NODES[node];
  return domName
    ? typeof domName === 'string' ? domName : domName(parent)
    : 'jdita-node-' + node;
}