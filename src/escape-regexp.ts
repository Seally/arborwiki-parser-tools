/**
 * Match the characters in this list:
 * https://tc39.es/ecma262/#prod-SyntaxCharacter
 */
const REGEXP_SYNTAX_CHARACTER_PATTERN = /[\^$\\.*+?()[\]{}|]/g;

/**
 * Escape the string for insertion into a `RegExp` pattern without special
 * meanings.
 *
 * The output of this function should **NOT** be placed inside a character class
 * or other weird, non-concatenable positions of a `RegExp`.
 *
 * The characters escaped are: `^ $ \ . * + ? ( ) [ ] { } |`
 *
 * _Source:_ https://tc39.es/ecma262/#prod-SyntaxCharacter
 */
export function escapeRegExp(input: string) {
    return input.replace(REGEXP_SYNTAX_CHARACTER_PATTERN, "\\$&");
}
