# ProseMirror LwDITA

An integration of [evolvedbinary/lwdita](https://github.com/evolvedbinary/lwdita) and [ProseMirror](https://www.prosemirror.net).

## Usage

Add the library to your project using Yarn or Npm:

```shell
yarn add @evolvedbinary/prosemirror-lwdita
```

```shell
npm install @evolvedbinary/prosemirror-lwdita
```

Include the Library:

```javascript
// SCHEMA builder
import { schema } from "@evolvedbinary/prosemirror-lwdita";
//PLUGINS
import { menu, shortcuts } from "@evolvedbinary/prosemirror-lwdita";
import { document } from "@evolvedbinary/prosemirror-lwdita";
//Transform library
import { xditaToJson } from "lwdita";
```
