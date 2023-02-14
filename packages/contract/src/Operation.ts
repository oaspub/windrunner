import {
    Static,
    TArray,
    TFunction,
    TLiteral,
    TObject,
    TUndefined,
    Type
} from '@sinclair/typebox'
import {TypeGuard} from '@sinclair/typebox/guard'
import {CommandInputSchema} from './Command'

export type CommandCallbackSchema<
    T extends TArray | TObject | TUndefined = any,
    U extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> = TFunction<[CommandInputSchema<U, N, A>], T>

export type CommandCallback<
    T extends TArray | TObject | TUndefined = any,
    U extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> = Static<CommandCallbackSchema<T, U, N, A>>

export interface CommandDefinitionOptions<
    Name extends string,
    T extends TArray | TObject | TUndefined = any,
    U extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> {
    name: Name,
    method: string,
    route: RegExp,
    response: T
    params: U
    queries: N
    body: A
}

export class Operation<
    Name extends string = string,
    T extends TArray | TObject | TUndefined = any,
    U extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> {
    readonly name: Name
    Method: TLiteral
    Route: RegExp
    Response: T
    Params: U
    Queries: N
    Body: A
    Callback: CommandCallbackSchema<T, U, N, A>

    constructor ({
        name,
        method,
        route,
        response,
        params,
        queries,
        body
    }: CommandDefinitionOptions<Name, T, U, N, A>) {
        this.name = name
        this.Method = Type.Literal(method.toLowerCase())
        this.Route = route
        this.Response = response
        this.Params = params
        this.Queries = queries
        this.Body = body

        const inputs: TObject[] = []
        if (!TypeGuard.TUndefined(params)) inputs.push(params)
        if (!TypeGuard.TUndefined(queries)) inputs.push(queries)
        if (!TypeGuard.TUndefined(body)) inputs.push(body)
        this.Callback = Type.Function([Type.Intersect(inputs)], response)
    }
}

export class Filter<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject
> extends Operation<Name, TArray<T>, TUndefined, N, TUndefined> {
    constructor (name: Name, resource: T, filterOn: N) {
        const method = 'get',
          route = ResourcePathRx(name),
          response = Type.Array(resource), body = Type.Undefined(),
          params = Type.Undefined(),
          queries = filterOn
        super({ name, method, route, response, body, params, queries })
    }
}

export class Create<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> extends Operation<Name, T, TUndefined, TUndefined, A> {
    constructor (name: Name, resource: T, writeable: A) {
        const method = 'post',
          route = ResourcePathRx(name),
          response = resource, body = writeable,
          params = Type.Undefined(),
          queries = Type.Undefined()
        super({ name, method, route, response, body, params, queries })
    }
}

export class Find<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    U extends TObject | TUndefined = TObject
> extends Operation<Name, T, U, TUndefined, TUndefined> {
    constructor (name: Name, resource: T, keyOn: U) {
        const method = 'get',
          route = ResourceInstancePathRx(name, keyOn),
          response = resource,
          body = Type.Undefined(),
          params = keyOn, queries = Type.Undefined()
        super({ name, method, route, response, body, params, queries })
    }
}

export class Replace<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    U extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> extends Operation<Name, T, U, TUndefined, A> {
    constructor (name: Name, resource: T, writeable: A, keyOn: U) {
        const method = 'put',
          route = ResourceInstancePathRx(name, keyOn),
          response = resource,
          body = writeable,
          params = keyOn, queries = Type.Undefined()
        super({ name, method, route, response, body, params, queries })
    }
}

export class Modify<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    U extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> extends Operation<Name, T, U, TUndefined, A> {
    constructor (name: Name, resource: T, writeable: A, keyOn: U) {
        const method = 'patch',
          route = ResourceInstancePathRx(name, keyOn),
          response = resource,
          body = writeable,
          params = keyOn, queries = Type.Undefined()
        super({ name, method, route, response, body, params, queries })
    }
}

export class Remove<
    Name extends string,
    T extends TObject | TUndefined = TObject,
    U extends TObject | TUndefined = TObject
> extends Operation<Name, TUndefined, U, TUndefined, TUndefined> {
    constructor (name: Name, keyOn: U) {
        const method = 'delete',
          route = ResourceInstancePathRx(name, keyOn),
          response = Type.Undefined(),
          body = Type.Undefined(),
          params = keyOn, queries = Type.Undefined()
        super({ name, method, route, response, body, params, queries })
    }
}

const ResourcePathRx = (name: string): RegExp => {
    return new RegExp(`^\/${name}\/?$`)
}

const ResourceInstancePathRx = (name: string, keyOn: TObject | TUndefined): RegExp => {
    return new RegExp(`^\/${name}\/${Object.keys(keyOn.properties).map(key => `(?<${key}>).+`).join(',')}\/?$`)
}
