import {TFunction} from '@sinclair/typebox'

export type Noun = string

export type ControllerMethod = 'filter' | 'create' | 'find' | 'replace' | 'modify' | 'remove'

export type TInterface = { [name: ControllerMethod]: TFunction<any[], any> }

export class Contract<
    Name extends Noun = Noun,
    Interface extends TInterface = TInterface
> {
    constructor(public readonly name: Name, public readonly methods: Interface) { }
}
