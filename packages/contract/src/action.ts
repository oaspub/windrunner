import { Verb } from './verb'

export type UpperCaseLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

export type Action<Verb extends string = string, Noun extends string = string> = `${Verb}${UpperCaseLetter}${Noun}`

export type ActionVerb<T extends string> = T extends `${infer Verb}${UpperCaseLetter}${infer Noun}` ? Verb : never

export type ActionNoun<T extends string> = T extends `${infer Verb}${UpperCaseLetter}${infer Noun}`
  ? T extends `${Verb}${infer U}${Noun}`
    ? `${U}${Noun}`
    : never
  : never

export type ActionNounPlural<T extends string, Suffix extends string = 's'> = `${ActionNoun<T>}${Suffix}`

export function parseAction<A extends Action> (action: A, dictionary: Map<string, Verb>): [ActionVerb<A>, ActionNoun<A>] {
    const [verb, noun] = action.split(':') as [ActionVerb<A>, ActionNoun<A>]
    if (!dictionary.has(verb)) {
        throw new Error(`Encountered an unknown verb ${verb}. Please add it to the dictionary or use one of the built-in verbs.`)
    }
    return [verb, noun]
}
