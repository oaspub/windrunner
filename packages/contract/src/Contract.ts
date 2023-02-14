import {Operation} from './Operation'
import {Command} from './Command'

type Commands<
    T extends Operation[],
    Context extends Record<string, unknown> = Record<string, unknown>
> = { [K in keyof T[number]['name']]: Command<unknown, unknown, T[number], Context> }

export class Contract<T extends Operation[] = Operation[]> {
    public readonly commands: Commands<T>

    constructor(
        public readonly name: string,
        public readonly operations: T
    ) {
        this.commands = operations.reduce((agg, operation) => {
            const C = Command.Factory(operation)
            return {...agg, [C.name]: C}
        }, {} as Commands<T>)
    }

    declare<O extends Operation>(operation: O): Contract<[...T, O]> {
        const operations = [...this.operations, operation] as [...T, O]
        return new Contract(this.name, operations)
    }
}
