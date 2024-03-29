import { Logger } from 'pino'
import { hasOwnProperties, isNotEmptyString } from './util'

export interface MiddlewareHandlerArguments<Request = unknown, Response = unknown, Input = unknown, Output = unknown> {
    /**
     * Serialized input as a response object, such as the Fetch API Deserialize or
     * NodeJS IncomingMessage objects.
     */
    request?: Request

    /**
     * Serialized output as a response object, such as the Fetch API Response or
     * NodeJS ServerResponse objects.
     */
    response?: Response

    /**
     * Input to a command.
     */
    input?: Input

    /**
     * Output from a command.
     */
    output?: Output
}

export type MiddlewareExecutionContext<T extends Record<string, unknown> = Record<string, unknown>> = {
    /**
     * A logger library compatible with Pino for logging in middleware layers.
     */
    logger: Logger
} & T

export type MiddlewareHandler<Request, Response, Input, Output> = (args: MiddlewareHandlerArguments<Request, Response, Input, Output>) => Promise<MiddlewareHandlerArguments<Request, Response, Input, Output>>

export type MiddlewareFunction<Request, Response, Input, Output, Context extends Record<string, unknown>> = (next: MiddlewareHandler<Request, Response, Input, Output>, context: Context) => MiddlewareHandler<Request, Response, Input, Output>

export type Terminalware<Request, Response, Input, Output, Context extends Record<string, unknown>> = (context: MiddlewareExecutionContext<Context>) => MiddlewareHandler<Request, Response, Input, Output>

export interface MiddlewareOptions {
    /**
     * A unique name to refer to a middleware
     */
    name?: string
    /**
     * A list of strings to any that identify the general purpose or important
     * characteristics of a given handler.
     */
    tags?: string[]
}

/**
 * A type for describing fully-qualified middleware functions
 */
export type Middleware<Request, Response, Input, Output, Context extends Record<string, unknown> = Record<string, unknown>> = MiddlewareFunction<Request, Response, Input, Output, Context> & {
    name: string
    tags: string[]
}

/**
 * A factory function for adjoining absolute middleware options to the absolute middleware
 * function with sensible defaults
 *
 * @param fn - A function to make into a middleware.
 * @param options - Additional options that determine the sorting of
 * the middleware on the stack.
 *   - The name of the middleware must be unique to
 * the stack.
 *   - Tags will group your middleware and should be used in plugins so that by
 * removing middleware by tag will remove the whole plugin.
 * @returns A middleware function.
 */
export function MiddlewareFactory<Request, Response, Input, Output, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Request, Response, Input, Output, Context>,
  options: MiddlewareOptions = {}
): Middleware<Request, Response, Input, Output, Context> {
    return Object.defineProperties(fn, {
        name: { value: options.name ?? isNotEmptyString(fn.name), writable: false },
        tags: { value: options.tags ?? [], writable: false },
    }) as Middleware<Request, Response, Input, Output, Context>
}

/**
 * A type guard for middleware
 *
 * @param value - Any value to check.
 * @returns Indicates if the value is of the type.
 */
export function isMiddleware (value: unknown): value is Middleware<unknown, unknown, object, object> {
    return typeof value === 'function' && hasOwnProperties(value, 'name', 'tags')
}

export interface AbsoluteMiddlewareOptions extends MiddlewareOptions {
    /**
     * Handlers are ordered using a "step" that describes the stage of command
     * execution at which the handler will be executed. The available steps are:
     *
     * - initialize: The input is being prepared. Examples of typical
     *      initialization tasks include injecting default options computing
     *      derived parameters.
     * - serialize: The input is complete and ready to be serialized. Examples
     *      of typical serialization tasks include input validation and building
     *      an HTTP request from user input.
     * - build: The input has been serialized into an HTTP request, but that
     *      request may require further modification. Any request alterations
     *      will be applied to all retries. Examples of typical build tasks
     *      include injecting HTTP headers that describe a stable aspect of the
     *      request, such as `Content-Length` or a body checksum.
     * - finalizeRequest: The request is being prepared to be sent over the wire. The
     *      request in this stage should already be semantically complete and
     *      should therefore only be altered as match the recipient's
     *      expectations. Examples of typical finalization tasks include request
     *      signing and injecting hop-by-hop headers.
     * - deserialize: The response has arrived, the middleware here will deserialize
     *      the raw response object to structured response
     *
     *      Unlike initialization and build handlers, which are executed once
     *      per operation execution, finalization and deserialize handlers will be
     *      executed foreach HTTP request sent.
     *
     * **Note**
     * The order of the step is determined by the context that the middleware stack is
     * executed in. For example, in an SDK client the request must be serialized first
     * and the output deserialized while on in a server context these two steps are
     * swapped.
     */
    step?: Step

    /**
     * By default, middleware will be added to individual step in un-guaranteed order.
     */
    priority?: Priority
}

/**
 * A type for describing fully-qualified absolute middleware functions
 */
export type AbsoluteMiddleware<Request = unknown, Response = unknown, Input = unknown, Output = unknown, Context extends Record<string, unknown> = Record<string, unknown>> = Middleware<Request, Response, Input, Output, Context> & {
    step: Step
    priority: Priority
}

/**
 * A factory function for adjoining absolute middleware options to the absolute middleware
 * function
 *
 * @param fn - A function to make into an absolute middleware.
 * @param options - Additional properties used to determine the position of the
 * middleware in the stack. The step determines what lifecycle the middleware will run
 * in while the priority determines the order of the middleware within the step. A
 * high priority will run after a low priority middleware.
 * @returns An absolute middleware function.
 */
export function AbsoluteMiddlewareFactory<Request, Response, Input, Output, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Request, Response, Input, Output, Context>,
  options: AbsoluteMiddlewareOptions = {}
): AbsoluteMiddleware<Request, Response, Input, Output, Context> {
    return Object.defineProperties(MiddlewareFactory(fn, options), {
        step: { value: options.step ?? 1, writable: false },
        priority: { value: options.priority ?? Priority.NORMAL, writable: false }
    }) as AbsoluteMiddleware<Request, Response, Input, Output, Context>
}

/**
 * A type guard for absolute middleware
 *
 * @param value - Any value to check.
 * @returns Indicates if the given value is of the type.
 */
export function isAbsoluteMiddleware (value: unknown): value is AbsoluteMiddleware {
    return isMiddleware(value) && hasOwnProperties(value, 'step', 'priority')
}

export interface RelativeMiddlewareOptions extends MiddlewareOptions {
    /**
     * Specify the relation to be before or after a know middleware.
     */
    relation: Relation

    /**
     * A known middleware name to indicate inserting location.
     */
    toMiddleware: string
}

export type RelativeMiddleware<Request = unknown, Response = unknown, Input = unknown, Output = unknown, Context extends Record<string, unknown> = Record<string, unknown>> = Middleware<Request, Response, Input, Output, Context> & {
    relation: Relation
    toMiddleware: string
}

/**
 * A factory function for adjoining relative middleware options to the relative middleware
 * function
 *
 * @param fn - Any middleware function.
 * @param options - Additional properties used to determine
 * sort order of the middleware.
 * @param options -.toMiddleware The name of the middleware used as a placement
 * anchor.
 * @param options -.relation Specify the relation to the middleware.
 * @returns A relative middleware function.
 */
export function RelativeMiddlewareFactory<Request, Response, Input, Output, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Request, Response, Input, Output, Context>,
  options: RelativeMiddlewareOptions
): RelativeMiddleware<Request, Response, Input, Output, Context> {
    return Object.defineProperties(MiddlewareFactory(fn, options), {
        relation: { value: options.relation, writable: false },
        toMiddleware: { value: options.toMiddleware, writable: false }
    }) as RelativeMiddleware<Request, Response, Input, Output, Context>
}

/**
 * A type guard for relative middleware
 *
 * @param value - A value for checking its type.
 * @returns Indicates that the value is or is not the type.
 */
export function isRelativeMiddleware (value: unknown): value is RelativeMiddleware {
    return isMiddleware(value) && hasOwnProperties(value, 'relation', 'toMiddleware')
}

/**
 * There are five data interchange lifecycle steps, though the execution order may
 * differ based on the execution context. The step is therefore an ordinal
 * between zero and four, with step zero middleware running first and step four
 * middleware running last.
 */
export type Step = 0 | 1 | 2 | 3 | 4

/**
 * High priority middleware is executed first; low priority middleware last.
 */
export enum Priority {
    High,
    NORMAL,
    Low
}

/**
 * "before" means the middleware will run before the target middleware; likewise,
 * middleware with an "after" relationship to the target will run after the target.
 */
export enum Relation {
    BEFORE,
    AFTER
}
