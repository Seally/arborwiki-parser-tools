# Simple Lexer

An extremely simple JavaScript `RegExp`-based lexer. It has no advanced
capabilities. It will never have them, else it'd no longer be "simple". But
sometimes, what it can do is all that you need.

[Read the documentation](https://seally.github.io/jsr-simple-lexer/).

## Example

Creating a lexer for JSON:

```typescript
import { SimpleLexer } from "@seally/simple-lexer";

const lexer = new SimpleLexer({
    tokens: {
        "whitespace": /\s+/u,
        "openBrace": "{",
        "closeBrace": "}",
        "openBracket": "[",
        "closeBracket": "]",
        "comma": ",",
        "colon": ":",
        "null": "null",
        "boolean": /true|false/u,
        "number": /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/u,
        "string": /"(?:[^"\\]|\\(?:["\\\/bfnrt]|u[0-9A-Fa-f]{4}))*"/u,
    },
});

// Note that `tokenize()` returns a generator, so spread the result into an
// array if you need a list of tokens.
console.log([
    ...lexer.tokenize(
        '{ "foo": "bar", "fruits": ["apple", "cherry", "kiwi"] }',
    ),
]);
```

This should print something like:

```js
[
    { type: "openBrace", image: "{", startOffset: 0, nextOffset: 1 },
    { type: "whitespace", image: " ", startOffset: 1, nextOffset: 2 },
    { type: "string", image: '"foo"', startOffset: 2, nextOffset: 7 },
    { type: "colon", image: ":", startOffset: 7, nextOffset: 8 },
    { type: "whitespace", image: " ", startOffset: 8, nextOffset: 9 },
    { type: "string", image: '"bar"', startOffset: 9, nextOffset: 14 },
    { type: "comma", image: ",", startOffset: 14, nextOffset: 15 },
    { type: "whitespace", image: " ", startOffset: 15, nextOffset: 16 },
    {
        type: "string",
        image: '"fruits"',
        startOffset: 16,
        nextOffset: 24,
    },
    { type: "colon", image: ":", startOffset: 24, nextOffset: 25 },
    { type: "whitespace", image: " ", startOffset: 25, nextOffset: 26 },
    { type: "openBracket", image: "[", startOffset: 26, nextOffset: 27 },
    { type: "string", image: '"apple"', startOffset: 27, nextOffset: 34 },
    { type: "comma", image: ",", startOffset: 34, nextOffset: 35 },
    { type: "whitespace", image: " ", startOffset: 35, nextOffset: 36 },
    {
        type: "string",
        image: '"cherry"',
        startOffset: 36,
        nextOffset: 44,
    },
    { type: "comma", image: ",", startOffset: 44, nextOffset: 45 },
    { type: "whitespace", image: " ", startOffset: 45, nextOffset: 46 },
    { type: "string", image: '"kiwi"', startOffset: 46, nextOffset: 52 },
    { type: "closeBracket", image: "]", startOffset: 52, nextOffset: 53 },
    { type: "whitespace", image: " ", startOffset: 53, nextOffset: 54 },
    { type: "closeBrace", image: "}", startOffset: 54, nextOffset: 55 },
];
```
