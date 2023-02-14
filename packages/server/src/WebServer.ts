import {Operation, Contract} from '@windrunner/contract'
import {IncomingMessage, Server, ServerResponse} from 'http'
import Pino from 'pino'
import PinoHttp from 'pino-http'
import { WebServerController } from './Controller'
import {
    MiddlewareExecutionContext,
    MiddlewareHandler,
    MiddlewareHandlerArguments,
    MiddlewareStack, Terminalware
} from '@windrunner/middleware'
import { Router } from './Router'
import { Static } from '@sinclair/typebox'
import {createServerCommand, ServerCommand} from "./ServerCommand";

export interface WebServerConfig<Context extends Record<string, unknown>> {
    context?: MiddlewareExecutionContext<Context>
}

export class WebServer<T extends Contract, Context extends Record<string, unknown> = Record<string, unknown>> extends Server {
    protected readonly context: MiddlewareExecutionContext<Context>
    readonly middleware = new MiddlewareStack<IncomingMessage, ServerResponse, any, any, MiddlewareExecutionContext>()

    constructor (
      private readonly contract: T,
      private readonly controller: WebServerController<T, Context>,
      config?: WebServerConfig<Context>
    ) {
        /** Initialize NodeJS Server */
        super()

        /** Initialize context */
        this.context = {
            ...config?.context,
            logger: config?.context?.logger ?? Pino()
        } as MiddlewareExecutionContext<Context>

        for (const name in this.contract.operations) {
            const CommandDef = this.contract.operations[name]
            const callback = this.controller[name]
            if (callback == null) {
                /** TODO - Throw server start error */
                throw Error(`Controller callback "${name}" not found`)
            }
        }
    }

    declare<
      F extends T['operations'][K]['Callback'],
      K extends keyof T['operations']
    > (action: K, callback: Static<F>): this {
        this.controller[action] = callback
        return this
    }

    async send<I = unknown, O = unknown>(command: ServerCommand<I, O>, commandDefinition: Operation) {

    }
}
