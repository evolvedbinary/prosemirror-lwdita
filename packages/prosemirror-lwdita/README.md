# ProseMirror LwDITA

An integration of [evolvedbinary/lwdita](https://github.com/evolvedbinary/lwdita) and [ProseMirror](https://www.prosemirror.net).

## Usage

Add the library to your project using Yarn or Npm:

```shell
yarn add @marmoure/prosemirror-lwdita
```

```shell
npm install @marmoure/prosemirror-lwdita
```

Include the Library:

```javascript
// SCHEMA builder
import { schema } from "@marmoure/prosemirror-lwdita";
//PLUGINS
import { menu, shortcuts } from "@marmoure/prosemirror-lwdita";
import { document } from "@marmoure/prosemirror-lwdita";
//Transform library
import { xditaToJson } from "lwdita";
```

## Schema

The implemented schema complies with the LwDITA specs v0.3.0.2, see: [https://github.com/oasis-tcs/dita-lwdita/releases/tag/v0.3.0.2](https://github.com/oasis-tcs/dita-lwdita/releases/tag/v0.3.0.2)
