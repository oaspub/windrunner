import { Contract } from '@windrunner/contract'
import { Static, TFunction } from '@sinclair/typebox'

export type WebServerCallback<
  F extends TFunction<any[], any>
> = Static<F>

export type WebServerController<
  T extends Contract<any>,
  Context extends Record<string, unknown> = Record<string, unknown>
> = {
    [K in keyof T['operations']]?: WebServerCallback<T['operations'][K]['Callback']>
}

export class Controller<T extends Contract<any>> {
    callbacks:
    constructor (public readonly contract: T) {

    }
}
