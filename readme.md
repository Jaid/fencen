# fencen

Safe and simple utilities for wrapping code in Markdown-style fences.

## Usage

```ts
import fencen, {blockFences, inlineFences, pickFence} from 'fencen'

fencen('hello')
// ```
// hello
// ```

const fence = pickFence('hello')
fence.opener() // '```\n'
fence.closer() // '\n```'

fencen('hello ` world', {inline: true})
// `` hello ` world ``

fencen('const value = 1', {inline: true, language: 'ts'})
// <code language="ts">const value = 1</code>
```

`pickFence` returns a `Fence` with `opener()` and `closer()` renderers. Block Markdown fences render `language` after the opener. Inline output with a language uses the XML `<code language="…">` fence because Markdown inline-code fences have no language syntax. XML attribute values are escaped.

## Trimming

`trim` accepts a boolean or object:

```ts
fencen(input, {
  trim: {
    vertical: true,
    lines: true,
    indentation: true,
  },
})
```

`trim: true` is equivalent to:

```ts
{
  vertical: true,
  lines: false,
  indentation: false,
}
```

`vertical` removes surrounding blank lines, `lines` trims trailing whitespace from each line and `indentation` removes shared leading indentation. `trim` defaults to `true`.

## Fence candidates

`blockFences` and `inlineFences` are static arrays. `pickFence` checks them in order and throws a `RangeError` if none is safe.

Block candidates are:

```text
```
````
`````
``````
~~~
~~~~
~~~~~
~~~~~~
```````
~~~~~~~
````````
<code>
```

Inline candidates are:

```text
`
``
```
````
<code>
```

Multi-backtick inline fences include a trailing space in the opener and a leading space in the closer. The single-backtick fence and `<code>` fallback are unspaced.
