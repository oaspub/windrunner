import {Static, TSchema} from "@sinclair/typebox";
import {TypeCheck, TypeCompiler} from "@sinclair/typebox/compiler";

export class Validator<Schema extends TSchema> {
    Type: TypeCheck<Schema>

    constructor(schema: Schema, references?: TSchema[]) {
        this.Type = TypeCompiler.Compile(schema, references)
    }

    is(data: unknown): data is Static<Schema> {
        return this.Type.Check(data)
    }

    parse(data: unknown): Static<Schema> {
        if (!this.Type.Check(data)) {
            return new AggregateError(this.Type.Errors(data), 'Validation Error')
        }
        return data
    }
}