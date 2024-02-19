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
 * @param node - JDITA node name
 * @param parent - JDITA parent node name
 * @returns HTML node name
 */
export function getDomNode(node: string, parent?: string): string {
  const domName = DOM_NODES[node];
  // this is still unclear
  return domName
    ? typeof domName === 'string' ? domName : domName(parent)
    : 'jdita-node-' + node;
}