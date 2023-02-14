import {Static, TSchema} from '@sinclair/typebox'
import {Contract, ControllerMethod, Noun, TInterface} from './contract'
import {plural} from 'pluralize'

export interface WebServerOptions {
    keys?: {
        [name: string]: TSchema
    }
    filter?: {
        [name: string]: TSchema
    }
    sort?: readonly string[]
}

export class WebServer<
    Name extends Noun = Noun,
    Interface extends TInterface = TInterface,
    Options extends WebServerOptions
> {
    private readonly routes: {
        [name: ControllerMethod]: Static<Interface[ControllerMethod]>
    }
    constructor(private readonly contract: Contract<Name, Interface>, options?: Options) {
        const root = `/${plural(contract.name)}`
        for (const method in contract.methods) {
            switch (method) {
                case 'filter':
                case 'create':
                    break
                case ''
            }
        }
    }
}