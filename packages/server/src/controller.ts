import { Contract } from '@windrunner/contract'
import { Static } from '@sinclair/typebox'

export type WebServerCallback<T extends Contract<any>, K extends keyof T['operations']> = Static<T['operations'][K]['Function']>

export type WebServerController<T extends Contract<any>> = {
    [K in keyof T['operations']]?: WebServerCallback<T, K>
}
