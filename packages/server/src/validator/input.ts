import {Type} from '@sinclair/typebox'
import {Operation, CommandInputSchema, CommandInput} from '@windrunner/contract'
import {IncomingMessage} from 'http'
import {URL} from 'url'
import {ValueError} from '@sinclair/typebox/value'
import {ValueErrorType} from '@sinclair/typebox/compiler'
import {Validator} from './validator'

export class CommandInputValidator<T extends Operation> extends Validator<CommandInputSchema<T['Params'], T['Queries'], T['Body']>> {
    constructor(private readonly operation: T) {
        const inputSchema = Type.Intersect([operation.Params, operation.Queries, operation.Body])
        super(inputSchema)
    }

    async parseIncomingMessage (req: IncomingMessage): Promise<CommandInput<T>> {
        const [params, queries, body] = await Promise.all([this.getParams(req), this.getQueries(req), this.getBody(req)])
        const args = Object.freeze({ params, queries, body })
        if (!this.Type.Check(args)) {
            throw AggregateError(this.Type.Errors(args), 'Bad Request')
        }
        return args
    }

    private async getParams (req: IncomingMessage): Promise<unknown> {
        const url = new URL(req.url!, `https:${req.headers.host}`)
        const params = this.operation.Route.exec(url.pathname)?.groups
        return params != undefined ? Object.freeze(params) : params
    }

    private async getQueries (req: IncomingMessage): Promise<unknown> {
        const url = new URL(req.url!, `https:${req.headers.host}`)
        const queries = Object.fromEntries(url.searchParams)
        return queries !== undefined ? Object.freeze(queries) : queries
    }

    private getBody (req: IncomingMessage): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = []
            let body: Record<string, unknown> | undefined

            /** What to do with request errors? */
            req.on('error', reject)

            /** Chunk through the request */
            req.on('data', aggregateData(chunks))

            /** When the data stream ends, parse and validate */
            req.on('end', () => {
                const data = Buffer.concat(chunks).toString()
                try {
                    if (data !== '') {
                        /** Parse the body as JSON */
                        body = JSON.parse(data)
                    } /** Body is empty */
                } catch (e) {
                    /** Always throw a ValueError[] for a bad request */
                    reject([JSONValueError(data, e as SyntaxError)])
                }
                resolve(body !== undefined ? Object.freeze(body) : body)
            })
        })
    }
}

const JSONValueError = (value: string, error: SyntaxError): ValueError => {
    return {
        type: ValueErrorType.String,
        schema: Type.String(),
        path: '',
        value,
        message: error.message
    }
}

const isIteratorError = (e: unknown): e is IterableIterator<ValueError> => {
    return e != null && Symbol.iterator in e
}

const capture = (errors: ValueError[]) => (e: unknown): undefined => {
    if (isIteratorError(e)) {
        errors.push(...e)
    }
    return undefined
}

const aggregateData = (chunks: Uint8Array[]) => (chunk: Uint8Array) => {
    chunks.push(chunk)
}
