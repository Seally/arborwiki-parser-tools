import { escapeRegExp } from "./escape-regexp.ts";

/**
 * A definition for a token type for `SimpleLexer`.
 */
export type SimpleLexerTokenDefinition<T extends keyof any = keyof any> = {
    /**
     * The name of the token.
     */
    type: T;
    /**
     * The pattern used for this token.
     *
     * Specify a string for an exact match. Specify a `RegExp` for more
     * complicated patterns.
     *
     * *Note:* Keep in mind that patterns will be combined into a single
     * concatenated `RegExp` with the `uy` flags (or `iuy` if `ignoreCase`
     * option is `true`). Flags set on the patterns in the token definition
     * itself will be _ignored_.
     */
    pattern: string | RegExp;
};

/**
 * Type representing acceptable formats to define token definitions for a
 * `SimpleLexer`
 */
export type SimpleLexerDefinitions = {
    /**
     * Token definitions for this lexer. Can be specified as an array of token
     * definition objects or
     */
    tokens:
        | Record<keyof any, SimpleLexerTokenDefinition["pattern"]>
        | SimpleLexerTokenDefinition[];
    /**
     * Set this to `true` to make the lexer patterns ignore casing.
     *
     * This cannot be set on a per-token basis, so if you need mixed case
     * sensitivity the token patterns must handle this by themselves (note that
     * flags on the pattern `RegExp`s are ignored).
     */
    ignoreCase?: boolean;
};

/**
 * A token generated by `SimpleLexer`.
 */
export type SimpleLexerToken<T extends keyof any> = {
    /**
     * The token type identifier.
     */
    type: T;

    /**
     * The `image` is the text value of this token.
     */
    image: string;

    /**
     * The starting offset, relative to index 0 of the input text.
     */
    startOffset: number;
    /**
     * The offset the _next_ token should start with, relative to index 0 of the
     * input text.
     */
    nextOffset: number;
};

function _cloneTokenDefinition<T extends keyof any>(
    { type, pattern }: SimpleLexerTokenDefinition<T>,
) {
    return { type, pattern };
}

type _ExtractType<D extends SimpleLexerDefinitions["tokens"]> = D extends
    readonly any[] ? D[number]["type"]
    : keyof D;

/**
 * A very basic lexer that simply just takes string and `RegExp` patterns and
 * spits out the associated tokens with no advanced bells and whistles.
 *
 * @example
 *
 * ```typescript
 * const lexer = new SimpleLexer({
 *     tokens: {
 *         inlineWhitespace: /[ \t]+/u,
 *         lineEnding: /\r\n?|[\n\f\v\u2028\u2029]/u,
 *         word: /[^ \t\r\n\f\v\u2028\u2029]+/u,
 *     }
 * });
 *
 * const tokens = lexer.tokenize(input);
 *
 * for (const token of tokens) {
 *     // ...
 * }
 * ```
 */
export class SimpleLexer<const D extends SimpleLexerDefinitions> {
    #definitions: SimpleLexerTokenDefinition[];
    #matchPattern: RegExp;

    constructor(definition: D) {
        if (Array.isArray(definition.tokens)) {
            this.#definitions = definition.tokens.map(_cloneTokenDefinition);
        } else {
            this.#definitions = Object.entries(definition.tokens).map(
                ([type, pattern]) => {
                    return { type, pattern };
                },
            );
        }

        this.#matchPattern = new RegExp(
            this.#definitions
                .map((definition) => {
                    let source: string;

                    if (typeof definition.pattern === "string") {
                        source = escapeRegExp(definition.pattern);
                    } else {
                        source = definition.pattern.source;
                    }

                    return `(${source})`;
                })
                .join("|"),
            definition.ignoreCase ? "iuy" : "uy",
        );
    }

    /**
     * Returns the associated token definition for the given `RegExp` match
     * index.
     */
    #getTokenDefinitionForIndex(matchIndex: number) {
        return this.#definitions[matchIndex - 1];
    }

    #matchAt(input: string, offset: number) {
        this.#matchPattern.lastIndex = offset;
        return this.#matchPattern.exec(input);
    }

    /**
     * Returns the index of the first matched capture group.
     */
    #getFirstValidMatchIndex(matches: RegExpExecArray) {
        // First match is the full match, which we don't use. We start at
        // index 1 instead.
        for (let i = 1; i < matches.length; ++i) {
            if (matches[i] !== undefined) {
                return i;
            }
        }

        return 0;
    }

    /**
     * Matches a token at the given `offset` in `input`.
     */
    match(
        input: string,
        offset: number,
    ): SimpleLexerToken<_ExtractType<D["tokens"]>> | null {
        const matches = this.#matchAt(input, offset);

        if (matches) {
            const matchIndex = this.#getFirstValidMatchIndex(matches);

            if (matchIndex > 0) {
                const match = matches[matchIndex];
                const tokenDefinition = this.#getTokenDefinitionForIndex(
                    matchIndex,
                );

                const nextOffset = offset + match.length;

                return {
                    type: tokenDefinition.type as _ExtractType<D["tokens"]>,

                    image: match,

                    startOffset: offset,
                    nextOffset: nextOffset,
                };
            }
        }

        return null;
    }

    /**
     * Tokenizes the `input` starting at the given `offset`.
     *
     * @param input The input string.
     * @param offset The offset to start parsing the input string. Default: `0`
     */
    *tokenize(input: string, offset = 0) {
        while (offset < input.length) {
            const token = this.match(input, offset);

            if (!token) {
                throw Error(
                    `Failed to tokenize input string at offset: ${offset}`,
                );
            }

            yield token;

            offset = token.nextOffset;
        }
    }
}
