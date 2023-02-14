/**
 * Much of this file comes from the \@aws-sdk/middleware-stack library (credited goes
 * to the AWS SDK Javascript Team) with a few modifications.
 */

import { Logger } from 'pino'
import { hasOwnProperties, isNotEmptyString } from './util'

export interface InitializeHandlerArguments<Input extends object> {
  /**
   * User input to a command. Reflects the userland representation of the
   * union of data types the command can effectively handle.
   */
  input: Input;
}

export interface InitializeHandlerOutput<Response, Output extends object> extends DeserializeHandlerOutput<Response, Output> {
  output: Output;
}

export interface SerializeHandlerArguments<Request, Input extends object> extends InitializeHandlerArguments<Input> {
  /**
   * The user input serialized as a request object.
   *
   * During the build phase of the execution of a middleware stack, a built
   * request may or may not be available.
   */
  request?: Request;
}

export type SerializeHandlerOutput<Response, Output extends object> = InitializeHandlerOutput<Response, Output>

export type BuildHandlerArguments<Request, Input extends object> = FinalizeHandlerArguments<Request, Input>

export type BuildHandlerOutput<Response, Output extends object> = InitializeHandlerOutput<Response, Output>

export interface FinalizeHandlerArguments<Request, Input extends object> extends SerializeHandlerArguments<Request, Input> {
  /**
   * The user input serialized as a request.
   */
  request: Request;
}

export type FinalizeHandlerOutput<Response, Output extends object> = InitializeHandlerOutput<Response, Output>

export type DeserializeHandlerArguments<Request, Input extends object> = FinalizeHandlerArguments<Request, Input>

export interface DeserializeHandlerOutput<Response, Output extends object> {
  /**
   * The raw response object from runtime is deserialized to structured output object.
   * The response object is unknown, so you cannot modify it directly. When work with
   * response, you need to guard its type to e.g. HttpResponse with 'instanceof' operand.
   *
   * During the deserialize phase of the execution of a middleware stack, a deserialized
   * response may or may not be available
   */
  response: Response;
  output?: Output;
}

export interface InitializeHandler<Response, Input extends object, Output extends object> {
  /**
   * Asynchronously converts an input object into an output object.
   *
   * @param args -  An object containing an input to the command as well as any
   *              associated or previously generated execution artifacts.
   */
  (args: InitializeHandlerArguments<Input>): Promise<InitializeHandlerOutput<Response, Output>>;
}

export interface SerializeHandler<Request, Response, Input extends object, Output extends object> {
  /**
   * Asynchronously converts an input object into an output object.
   *
   * @param args -  An object containing an input to the command as well as any
   *              associated or previously generated execution artifacts.
   */
  (args: SerializeHandlerArguments<Request, Input>): Promise<SerializeHandlerOutput<Response, Output>>;
}

export interface FinalizeHandler<Request, Response, Input extends object, Output extends object> {
  /**
   * Asynchronously converts an input object into an output object.
   *
   * @param args -  An object containing an input to the command as well as any
   *              associated or previously generated execution artifacts.
   */
  (args: FinalizeHandlerArguments<Request, Input>): Promise<FinalizeHandlerOutput<Response, Output>>;
}

export interface BuildHandler<Request, Response, Input extends object, Output extends object> {
  (args: BuildHandlerArguments<Request, Input>): Promise<BuildHandlerOutput<Response, Output>>;
}

export interface DeserializeHandler<Request, Response, Input extends object, Output extends object> {
  (args: DeserializeHandlerArguments<Request, Input>): Promise<DeserializeHandlerOutput<Response, Output>>;
}

export type MiddlewareExecutionContext<T extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * A logger library compatible with Pino for logging in middleware layers.
   */
  logger: Logger
} & T

/**
 * A factory function that creates functions implementing the Handler
 * interface.
 */
export interface InitializeFunction<Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * @param next - The handler to invoke after this middleware has operated on
   * the user input and before this middleware operates on the output.
   * @param context - Invariant data and functions for use by the handler.
   */
  (next: InitializeHandler<Response, Input, Output>, context: MiddlewareExecutionContext<Context>): InitializeHandler<Response, Input, Output>;
}

/**
 * A factory function that creates functions implementing the BuildHandler
 * interface.
 */
export interface SerializeFunction<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * @param next - The handler to invoke after this middleware has operated on
   * the user input and before this middleware operates on the output.
   * @param context - Invariant data and functions for use by the handler.
   */
  (next: SerializeHandler<Request, Response, Input, Output>, context: MiddlewareExecutionContext<Context>): SerializeHandler<Request, Response, Input, Output>;
}

/**
 * A factory function that creates functions implementing the FinalizeHandler
 * interface.
 */
export interface FinalizeFunction<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * @param next - The handler to invoke after this middleware has operated on
   * the user input and before this middleware operates on the output.
   * @param context - Invariant data and functions for use by the handler.
   */
  (next: FinalizeHandler<Request, Response, Input, Output>, context: MiddlewareExecutionContext<Context>): FinalizeHandler<Request, Response, Input, Output>;
}

export interface BuildFunction<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> {
  (next: BuildHandler<Request, Response, Input, Output>, context: MiddlewareExecutionContext<Context>): BuildHandler<Request, Response, Input, Output>;
}

export interface DeserializeFunction<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> {
  (next: DeserializeHandler<Request, Response, Input, Output>, context: MiddlewareExecutionContext<Context>): DeserializeHandler<Request, Response, Input, Output>;
}

export type MiddlewareFunction<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> =
  | InitializeFunction<Response, Input, Output, Context>
  | SerializeFunction<Request, Response, Input, Output, Context>
  | BuildFunction<Request, Response, Input, Output, Context>
  | FinalizeFunction<Request, Response, Input, Output, Context>
  | DeserializeFunction<Request, Response, Input, Output, Context>

/**
 * A factory function that creates the terminal handler atop which a middleware
 * stack sits.
 */
export type Terminalware<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = (context: MiddlewareExecutionContext<Context>) => DeserializeHandler<Request, Response, Input, Output>

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
export type Middleware<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = MiddlewareFunction<Request, Response, Input, Output, Context> & {
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
export function MiddlewareFactory<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
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
export type AbsoluteMiddleware<Request = unknown, Response = unknown, Input extends object = object, Output extends object = object, Context extends Record<string, unknown> = Record<string, unknown>> = Middleware<Request, Response, Input, Output, Context> & {
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
export function AbsoluteMiddlewareFactory<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Request, Response, Input, Output, Context>,
  options: AbsoluteMiddlewareOptions = {}
): AbsoluteMiddleware<Request, Response, Input, Output, Context> {
  return Object.defineProperties(MiddlewareFactory(fn, options), {
    step: { value: options.step ?? Step.INITIALIZE, writable: false },
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

export type RelativeMiddleware<Request = unknown, Response = unknown, Input extends object = object, Output extends object = object, Context extends Record<string, unknown> = Record<string, unknown>> = Middleware<Request, Response, Input, Output, Context> & {
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
export function RelativeMiddlewareFactory<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
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

export enum Step {
  INITIALIZE,
  SERIALIZE,
  BUILD,
  FINALIZE_REQUEST,
  DESERIALIZE,
}

export enum Priority {
  LOW,
  NORMAL,
  HIGH
}

export enum Relation {
  BEFORE,
  AFTER
}
