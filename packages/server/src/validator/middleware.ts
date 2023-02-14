import {
    AbsoluteMiddlewareOptions, Middleware,
    MiddlewareFactory,
    MiddlewareHandlerArguments,
    Priority
} from '@windrunner/middleware'
import {Operation, CommandInput, CommandOutput} from '@windrunner/contract'
import {IncomingMessage, ServerResponse} from 'http'
import {CommandInputValidator} from './input'
import {CommandOutputValidator} from './output'

export const ValidatorMiddlewareOptions: AbsoluteMiddlewareOptions = {
    name: 'DeserializeMiddleware',
    step: 1, /** Deserialize */
    priority: Priority.High,
    tags: ['SERVER']
}

export function ValidatorMiddleware<T extends Operation, Context extends Record<string, unknown> = Record<string, unknown>>(operation: T): Middleware<IncomingMessage, ServerResponse, CommandInput<T>, CommandOutput<T>, Context> {
    const CommandInput = new CommandInputValidator(operation)
    const CommandOutput = new CommandOutputValidator(operation)

    return MiddlewareFactory<IncomingMessage, ServerResponse, CommandInput<T>, CommandOutput<T>, Context>((next) => {
        return async (args) => {
            if (args.request == null) {
                /** TODO - throw HTTP internal error */
                throw Error('Internal Error')
            }
            const input = await CommandInput.parseIncomingMessage(args.request)
            const response = await next({...args, input})
            const output = CommandOutput.parse(args.output)
            return {...response, output}
        }
    }, ValidatorMiddlewareOptions)
}