import {Static, TIntersect, TObject, TUndefined} from '@sinclair/typebox'
import {Operation} from './Operation'
import {MiddlewareStack} from '@windrunner/middleware'

export type CommandInputSchema<
    U extends TObject | TUndefined = TObject,
    N extends TObject | TUndefined = TObject,
    A extends TObject | TUndefined = TObject
> = TIntersect<[Exclude<U, TUndefined>, Exclude<N, TUndefined>, Exclude<A, TUndefined>]>

export type CommandInput<T extends Operation> = Static<
    CommandInputSchema<T['Params'], T['Queries'], T['Body']>
>

export type CommandOutput<T extends Operation> = Static<T['Response']>

export interface CommandOptions<Req, Res, T extends Operation>{
    request?: Req
    response?: Res
    input?: CommandInput<T>
    output?: CommandOutput<T>
}

export abstract class Command<Req, Res, T extends Operation, Context extends Record<string, unknown> = Record<string, unknown>> {
    request?: Req
    response?: Res
    input?: CommandInput<T>
    output?: CommandOutput<T>

    readonly middleware = new MiddlewareStack<Req, Res, CommandInput<T>, CommandOutput<T>, Context>()
    abstract readonly definition: T

    constructor({ request, response, input, output }: CommandOptions<Req, Res, T>) {
        this.request = request
        this.response = response
        this.input = input
        this.output = output
    }

    static Factory<Req, Res, T extends Operation, Context extends Record<string, unknown> = Record<string, unknown>> (operation: T) {
        const C = class extends Command<Res, Req, T, Context> {
            readonly definition = operation
        }
        Object.defineProperty(C, 'name', { value: operation.name })
        return C
    }
}
