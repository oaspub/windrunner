import * as Generic from '@windrunner/middleware'
import { Request, Response } from './middleware'

export type Pluggable<Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = (this: MiddlewareStack<Input, Output, Context>) => void

export class MiddlewareStack<Input extends object = any, Output extends object = any, Context extends Record<string, unknown> = Record<string, unknown>>
  extends Generic.MiddlewareStack<Request, Response, Input, Output, Context> {}
