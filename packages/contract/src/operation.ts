import {
    TObject,
    TLiteral,
    TString,
    TVoid,
    Type,
    TFunction,
    TUndefined, TArray, TSchema
} from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Verb } from './verb'

export type Request<U extends TObject | TUndefined = TUndefined, N extends TObject | TUndefined = TUndefined, A extends TSchema = TUndefined> = TObject<{
    params: U
    queries: N
    body: A
}>

export interface OperationOptions<T extends TSchema = TVoid, U extends TObject | TUndefined = TUndefined, N extends TObject | TUndefined = TUndefined, A extends TSchema = TUndefined> {
    noun: string,
    verb: Verb,
    response: T
    params: U
    queries: N
    body: A
}

export class Operation<T extends TSchema, U extends TObject | TUndefined, N extends TObject | TUndefined, A extends TSchema> {
    Name: string
    Method: TypeCheck<TLiteral>
    Route: TypeCheck<TString>
    Response: TypeCheck<T>
    Params: TypeCheck<U>
    Queries: TypeCheck<N>
    Body: TypeCheck<A>
    Function: TFunction<[Request<U, N, A>], T>

    constructor ({
        verb,
        noun,
        response,
        params,
        queries,
        body
    }: OperationOptions<T, U, N, A>) {
        this.Name = noun
        this.Method = TypeCompiler.Compile(Type.Literal(verb.toMethod()))
        this.Route = TypeCompiler.Compile(Type.RegEx(verb.toRegExPath(noun)))
        this.Response = TypeCompiler.Compile(response)
        this.Params = TypeCompiler.Compile(params)
        this.Queries = TypeCompiler.Compile(queries)
        this.Body = TypeCompiler.Compile(body)
        this.Function = Type.Function([Type.Object({ params, queries, body })], response)
    }

    static Filter<T extends TObject | TVoid, N extends TObject | TUndefined> (resource: T, filterOn: N): Operation<TArray<T>, TUndefined, N, TUndefined> {
        const response = Type.Array(resource), body = Type.Undefined(), params = Type.Undefined(),
          queries = filterOn, noun = resource.$id ?? 'resource',
          verb = Verb.Filter()
        return new Operation({ noun, verb, response, body, params, queries })
    }

    static Create<T extends TObject | TVoid, A extends TObject> (returns: T, writeable: A): Operation<T, TUndefined, TUndefined, A> {
        const response = returns, body = writeable, params = Type.Undefined(),
          queries = Type.Undefined(), noun = returns.$id ?? 'resource', verb = Verb.Create()
        return new Operation({ noun, verb, response, body, params, queries })
    }

    static Find<T extends TObject | TVoid, U extends TObject | TUndefined> (resource: T, keyOn: U): Operation<T, U, TUndefined, TUndefined> {
        const response = resource, body = Type.Undefined(),
          params = keyOn, queries = Type.Undefined(),
          noun = resource.$id ?? 'resource',
          verb = Verb.Find(Object.keys(params.properties))
        return new Operation({ noun, verb, response, body, params, queries })
    }

    static Replace<T extends TObject | TVoid, U extends TObject | TUndefined, A extends TObject | TUndefined> (resource: T, writeable: A, keyOn: U): Operation<T, U, TUndefined, A> {
        const response = resource, body = writeable,
          params = keyOn, queries = Type.Undefined(),
          noun = resource.$id ?? 'resource',
          verb = Verb.Replace(Object.keys(params.properties))
        return new Operation({ noun, verb, response, body, params, queries })
    }

    static Modify<T extends TObject | TVoid, U extends TObject | TUndefined, A extends TObject | TUndefined> (resource: T, writeable: A, keyOn: U): Operation<T, U, TUndefined, A> {
        const response = resource, body = writeable,
          params = keyOn, queries = Type.Undefined(),
          noun = resource.$id ?? 'resource',
          verb = Verb.Modify(Object.keys(params.properties))
        return new Operation({ noun, verb, response, body, params, queries })
    }

    static Remove<T extends TObject | TVoid, U extends TObject | TUndefined> (keyOn: U): Operation<TVoid, U, TUndefined, TUndefined> {
        const response = Type.Void(), body = Type.Undefined(),
          params = keyOn, queries = Type.Undefined(),
          noun = 'resource',
          verb = Verb.Remove(Object.keys(params.properties))
        return new Operation({ noun, verb, response, body, params, queries })
    }
}
