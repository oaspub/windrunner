import * as Generic from '@windrunner/middleware'
import { IncomingMessage, ServerResponse } from 'http'
import { Priority, Relation, Step } from '@windrunner/middleware'

/** This file curries the request and response generic types in @windrunner/middleware */

export type Request = IncomingMessage

export type Response = ServerResponse

export interface InitializeHandlerArguments<Input extends object> extends Generic.InitializeHandlerArguments<Input> {}

export interface InitializeHandlerOutput<Output extends object> extends Generic.InitializeHandlerOutput<Response, Output> {}

export interface SerializeHandlerArguments<Input extends object> extends Generic.SerializeHandlerArguments<Request, Input> {}

export type SerializeHandlerOutput<Output extends object> = Generic.SerializeHandlerOutput<Response, Output>

export type BuildHandlerArguments<Input extends object> = Generic.BuildHandlerArguments<Request, Input>

export type BuildHandlerOutput<Output extends object> = Generic.BuildHandlerOutput<Response, Output>

export interface FinalizeHandlerArguments<Input extends object> extends Generic.FinalizeHandlerArguments<Request, Input> {}

export type FinalizeHandlerOutput<Output extends object> = Generic.FinalizeHandlerOutput<Response, Output>

export type DeserializeHandlerArguments<Input extends object> = Generic.DeserializeHandlerArguments<Request, Input>

export interface DeserializeHandlerOutput<Output extends object> extends Generic.DeserializeHandlerOutput<Response, Output> {}

export interface InitializeHandler<Input extends object, Output extends object> extends Generic.InitializeHandler<Response, Input, Output> {}

export interface SerializeHandler<Input extends object, Output extends object> extends Generic.SerializeHandler<Request, Response, Input, Output> {}

export interface FinalizeHandler<Input extends object, Output extends object> extends Generic.FinalizeHandler<Request, Response, Input, Output> {}

export interface BuildHandler<Input extends object, Output extends object> extends Generic.BuildHandler<Request, Response, Input, Output> {}

export interface DeserializeHandler<Input extends object, Output extends object> extends Generic.DeserializeHandler<Request, Response, Input, Output> {}

export type MiddlewareExecutionContext<T extends Record<string, unknown> = Record<string, unknown>> = Generic.MiddlewareExecutionContext<T>

export interface InitializeFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> extends Generic.InitializeFunction<Response, Input, Output> {}

export interface SerializeFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> extends Generic.SerializeFunction<Request, Response, Input, Output> {}

export interface FinalizeFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> extends Generic.FinalizeFunction<Request, Response, Input, Output> {}

export interface BuildFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> extends Generic.BuildFunction<Request, Response, Input, Output> {}

export interface DeserializeFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> extends Generic.DeserializeFunction<Request, Response, Input, Output> {}

export type MiddlewareFunction<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = Generic.MiddlewareFunction<Request, Response, Input, Output, Context>

export type Terminalware<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = Generic.Terminalware<Request, Response, Input, Output, Context>

export interface MiddlewareOptions extends Generic.MiddlewareOptions {}

export type Middleware<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = Generic.Middleware<Request, Response, Input, Output, Context>

export function MiddlewareFactory<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Input, Output, Context>,
  options: MiddlewareOptions = {}
): Middleware<Input, Output, Context> {
    return Generic.MiddlewareFactory(fn, options) as Middleware<Input, Output, Context>
}

export const isMiddleware = Generic.isMiddleware

export interface AbsoluteMiddlewareOptions extends Generic.AbsoluteMiddlewareOptions {}

export type AbsoluteMiddleware<Input extends object = object, Output extends object = object, Context extends Record<string, unknown> = Record<string, unknown>> = Generic.AbsoluteMiddleware<Request, Response, Input, Output, Context>

export function AbsoluteMiddlewareFactory<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Input, Output, Context>,
  options: AbsoluteMiddlewareOptions = {}
): AbsoluteMiddleware<Input, Output, Context> {
    return Generic.AbsoluteMiddlewareFactory(fn, options) as AbsoluteMiddleware<Input, Output, Context>
}

export const isAbsoluteMiddleware = Generic.isAbsoluteMiddleware

export interface RelativeMiddlewareOptions extends Generic.RelativeMiddlewareOptions {}

export type RelativeMiddleware<Input extends object = object, Output extends object = object, Context extends Record<string, unknown> = Record<string, unknown>> = Generic.RelativeMiddleware<Request, Response, Input, Output, Context>

export function RelativeMiddlewareFactory<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> (
  fn: MiddlewareFunction<Input, Output, Context>,
  options: RelativeMiddlewareOptions
): RelativeMiddleware<Input, Output, Context> {
    return Generic.RelativeMiddlewareFactory(fn, options) as RelativeMiddleware<Input, Output, Context>
}

export { Step, Priority, Relation }
