Hi @marijn, Thanks for pointing that out, indeed we had some of our nodes marked as `inline`.

I wonder if the difficulties we are experiencing are related to understanding how we should model something in ProseMirror Schema.

We have the situation where we would like an `img` element to be able to be used as both a block element, and as an inline element.

It may be that we still don't quite understand the ProseMirror definitions of "block" and "inline" nodes. We have read the documentation repeatedly, but we are still a little confused.


Our first example shows an `img` element mixed with other `block` elements (html, body, h1, etc.) in this case we think we need to define it as a block node in ProseMirror schema.

```html
<html>
  <title>Example of image mixed with block nodes</title>
  <body>
    <h1>Example 1</h1>
    <img src="image1.png"/>
  </body>
</html>
```

Our second example shows an `img` nested within a `p` element that also contains text and markup. In this case, we think we need to `define` it as an inline node in the ProseMirror schema.
```html
<html>
  <title>Example of image mixed with inline nodes</title>
  <body>
    <h1>Example 2</h1>
    <p>Here an image <img src="image1.png"/> for you</p>
  </body>
</html>
```

Both use cases are valid HTML.

If we try to model this in a ProseMirror schema, we seem to face an issue with mixing block and inline nodes in the body content, e.g.

```ts
const nodeSpec: NodeSpec = {
doc: {
      content: "html",
    },
    html: {
      content: "title body?",
      toDOM() {
        return ["html", {}, 0];
      },
    },
    title: {
      content: "text*",
      toDOM() {
        return ["title", {}, 0];
      },
    },
    body: {
      content: "(h1|img|p)*", // this is where we are struggling
      toDOM() {
        return ["body", {}, 0];
      },
    },
    h1: {
      content: "text*",
      toDOM() {
        return ["h1", {}, 0];
      },
    },
    block_img: {
      inline: false,
      attrs: {
        src: {
          default: "https://picsum.photos/200/300",
        },
      },
      toDOM(node) {
        return ["img", { src: node.attrs.src }];
      },
    },
    img: {
      inline: true,
      attrs: {
        src: {
          default: "https://picsum.photos/200/300",
        },
      },
      toDOM(node) {
        return ["img", { src: node.attrs.src }];
      },
    },
    p: {
      content: "(img|text)*",
      toDOM() {
        return ["p", {}, 0];
      },
    },
    text: {
      inline: true,
    },
}
```

Is it possible to create a schema that can have `img` nodes as both block and inline elements? If not, what are out options please?