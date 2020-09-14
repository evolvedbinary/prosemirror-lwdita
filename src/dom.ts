export const DOM_NODES: Record<string, string> = {
  body: 'div',
  desc: 'caption',
  document: 'doc',
  'dl-entry': '',
  fig: 'figure',
  fn: 'span',
  image: 'img',
  'media-source': 'source',
  'media-track': 'track',
  note: 'div',
  ph: 'span',
  prolog: '',
  shortdesc: 'p',
  'simple-table': 'table',
  stentry: 'td',
  sthead: 'head',
  strow: 'tr',
  title: 'h1',
  topic: 'article',
  xref: 'a',
}
export function getDomNode(node: string): string {
  return DOM_NODES[node] || 'jdita-node-' + node;
}