import { plural } from 'pluralize'
import { Method } from './method'

export enum Verbs {
    FILTER = 'filter',
    CREATE = 'create',
    FIND = 'find',
    REPLACE = 'replace',
    MODIFY = 'modify',
    REMOVE = 'remove'
}

export type VerbToRegExPath = (noun: string) => RegExp

export type VerbToMethod = () => Method

export interface VerbOptions {
    name: string
    toRegExPath: VerbToRegExPath
    toMethod: VerbToMethod
}

export class Verb {
    static toMethod (verb: Verbs): Method {
        const VerbToMethod: Record<Verbs, Method> = {
            filter: Method.GET,
            create: Method.POST,
            find: Method.GET,
            replace: Method.PUT,
            modify: Method.PATCH,
            remove: Method.DELETE
        }
        return VerbToMethod[verb]
    }

    static toPathRegEx (noun: string, keys?: string[] | null): RegExp {
        noun = plural(noun.toLowerCase())
        if (keys != null) {
            return new RegExp(`^/${noun}/${Array.from(new Set(keys)).map(key => `:${key}`).join(',')}$`)
        }
        return new RegExp(`^/${noun}/?$`)
    }

    public readonly name: string
    public readonly toRegExPath: VerbToRegExPath
    public readonly toMethod: VerbToMethod

    constructor (options: VerbOptions) {
        this.name = options.name
        this.toRegExPath = options.toRegExPath
        this.toMethod = options.toMethod
    }

    static Filter () {
        return new Verb({
            name: Verbs.FILTER,
            toRegExPath: (noun) => Verb.toPathRegEx(noun),
            toMethod: () => Verb.toMethod(Verbs.FILTER)
        })
    }

    static Create () {
        return new Verb({
            name: Verbs.CREATE,
            toRegExPath: (noun) => Verb.toPathRegEx(noun),
            toMethod: () => Verb.toMethod(Verbs.CREATE)
        })
    }

    static Find (keys: string[]) {
        return new Verb({
            name: Verbs.FIND,
            toRegExPath: (noun) => Verb.toPathRegEx(noun, keys),
            toMethod: () => Verb.toMethod(Verbs.FIND)
        })
    }

    static Replace (keys: string[]) {
        return new Verb({
            name: Verbs.REPLACE,
            toRegExPath: (noun) => Verb.toPathRegEx(noun, keys),
            toMethod: () => Verb.toMethod(Verbs.REPLACE)
        })
    }

    static Modify (keys: string[]) {
        return new Verb({
            name: Verbs.MODIFY,
            toRegExPath: (noun) => Verb.toPathRegEx(noun, keys),
            toMethod: () => Verb.toMethod(Verbs.MODIFY)
        })
    }

    static Remove (keys: string[]) {
        return new Verb({
            name: Verbs.REMOVE,
            toRegExPath: (noun) => Verb.toPathRegEx(noun, keys),
            toMethod: () => Verb.toMethod(Verbs.REMOVE)
        })
    }
}
