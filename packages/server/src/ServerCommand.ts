import {IncomingMessage, ServerResponse} from 'http'
import {Command, CommandOptions, Operation} from '@windrunner/contract'
import {ValidatorMiddleware} from './validator/middleware'

export function ServerCommandFactory<T extends Operation, Context extends Record<string, unknown> = Record<string, unknown>> (operation: T) {
    const C = class extends Command<IncomingMessage, ServerResponse, T, Context> {
        readonly definition = operation

        constructor(options: CommandOptions<IncomingMessage, ServerResponse, T>) {
            super(options)
            this.middleware.use(ValidatorMiddleware<T, Context>(operation))
        }
    }
    Object.defineProperty(C, 'name', { value: operation.name })
    return C
}