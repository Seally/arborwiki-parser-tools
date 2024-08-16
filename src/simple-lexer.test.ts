import { assertEquals } from "@std/assert";

import { SimpleLexer } from "./simple-lexer.ts";

Deno.test("SimpleLexer.prototype.tokenize()", () => {
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

    const input = [
        "{",
        '    "version": 1',
        "}",
    ].join("\n");

    const result = [...lexer.tokenize(input)];

    assertEquals(result, [
        {
            type: "openBrace",
            image: "{",
            startOffset: 0,
            nextOffset: 1
        },
        {
            type: "whitespace",
            image: "\n    ",
            startOffset: 1,
            nextOffset: 6,
        },
        {
            type: "string",
            image: '"version"',
            startOffset: 6,
            nextOffset: 15
        },
        {
            type: "colon",
            image: ":",
            startOffset: 15,
            nextOffset: 16
        },
        {
            type: "whitespace",
            image: " ",
            startOffset: 16,
            nextOffset: 17
        },
        {
            type: "number",
            image: "1",
            startOffset: 17,
            nextOffset: 18,
        },
        {
            type: "whitespace",
            image: "\n",
            startOffset: 18,
            nextOffset: 19
        },
        {
            type: "closeBrace",
            image: "}",
            startOffset: 19,
            nextOffset: 20
        },
    ]);
});
