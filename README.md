quick solution to get the value of a TypeScript string union **at runtime** using the TS compiler API.

Don't use this is production obviously! It's designed for build scripts that want to extract a TS union and do something with it.

there's probably a more idiomatic way to do this…

# usage

```js
import { evaluateStringUnion } from 'runtime-union';

const output = evaluateStringUnion('./path/to/file.ts', 'MyUnionType', {
  /* tsconfig */
});
```
