import {TString, Type} from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { TypeGuard } from '@sinclair/typebox/guard'
import { ValueError } from '@sinclair/typebox/value'

type RouteCheck<T> = (path: string) => T

const createRouteCheck = <T>(Type: TypeCheck<TString>, data: T): RouteCheck<T> => {
    return (path) => {
        if (Type.Check(path)) {
            /** The route does not match the given url path */
            throw new RouteValidationError(Type.Errors(path))
        }
        return data
    }
}

const swallow = () => undefined

export class Router<T> {
    private checks: RouteCheck<T>[] = []
    constructor (routes: [TString, T][] = []) {
        for (const [type, data] of routes) {
            this.add(type, data)
        }
    }

    add(type: RegExp | TString | TypeCheck<TString>, data: T): this {
        if (type instanceof RegExp) type = Type.RegEx(type)
        if (TypeGuard.TString(type)) type = TypeCompiler.Compile(type)
        this.checks.push(createRouteCheck(type, data))
        return this
    }

    async lookup (path: string): Promise<T | undefined> {
        return await Promise.any(this.checks.map(check => check(path))).catch(swallow)
    }
}

export class RouteValidationError extends Error {
    readonly details: string[]
    constructor (errors: IterableIterator<ValueError>) {
        super('Route validation failed')

        /** restore prototype */
        const proto = new.target.prototype
        Object.setPrototypeOf(this, proto)

        /** format error details */
        this.details = [...errors].map(e => `${e.message} but received ${e.value}.`)
    }
}
