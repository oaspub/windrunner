import { Operation } from './operation'
import { Action } from './action'

export class Contract<T extends Record<Action, Operation<any, any, any, any>>> {
    constructor (
      public readonly name: string,
      public readonly operations: T
    ) {}

    declare<A extends Action, O extends Operation<any, any, any, any>> (action: A, operation: O): Contract<T & { [K in A]: O }> {
        const operations = { ...this.operations, [action]: operation } as T & { [K in A]: O }
        return new Contract(this.name, operations)
    }
}
