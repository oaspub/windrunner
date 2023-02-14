import { Contract } from '@windrunner/contract'
import { Server } from 'http'
import Pino from 'pino'
import { WebServerCallback, WebServerController } from './controller'
import { MiddlewareStack, Request, Response } from './middleware'
import { Simplify } from './util'

export interface WebServerConfig {
    logger?: Pino.Logger | false
}

export class WebServer<T extends Contract<any>> extends Server {
    readonly stack: MiddlewareStack = new MiddlewareStack<Request, Response>()

    private listener (req: Request, res: Response): void {
        try {
            /** 1. TODO Route */
            // const operation = 'filter'

            /** 2. TODO Validate input */
            // const app = this.resolve(this.terminalware)
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'nothing to see here' }))
        } catch (e) {
            /** TODO - Handle and send an error response */
            res.writeHead(500, 'Unknown Error').end()
        }
    }

    constructor (
      private readonly contract: T,
      private readonly controller: WebServerController<T>,
      private readonly config?: WebServerConfig
    ) {
        super()
        this.on('request', this.listener)
    }

    declare<A extends keyof WebServerController<T>, C extends WebServerCallback<T, A>> (action: A, callback: C): WebServer<Contract<Simplify<T & { [K in A]: C }>>> {
        const controller = {
            ...this.controller,
            [action]: callback
        } as T & { [K in A]: C }
        return new WebServer(this.contract, controller, this.config)
    }
}
