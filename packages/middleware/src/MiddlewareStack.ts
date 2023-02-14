import remove from 'lodash.remove'
import {
  AbsoluteMiddleware,
  AbsoluteMiddlewareFactory,
  AbsoluteMiddlewareOptions,
  InitializeHandler,
  isAbsoluteMiddleware,
  isRelativeMiddleware,
  Middleware,
  MiddlewareExecutionContext,
  MiddlewareFunction,
  Relation,
  RelativeMiddleware,
  RelativeMiddlewareFactory,
  RelativeMiddlewareOptions,
  Terminalware
} from './Middleware'
import { hasOwnProperties } from './util'

export type Pluggable<Request, Response, Input extends object, Output extends object, Context extends Record<string, unknown> = Record<string, unknown>> = (this: MiddlewareStack<Request, Response, Input, Output, Context>) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MiddlewareStack<Request = unknown, Response = unknown, Input extends object = any, Output extends object = any, Context extends Record<string, unknown> = Record<string, unknown>> {
  readonly stack: Array<Middleware<Request, Response, Input, Output, Context>> = []
  protected names = new Set<string>()

  constructor (stack: Array<Middleware<Request, Response, Input, Output, Context>> = []) {
    for (const middleware of stack) {
      this.use(middleware)
    }
  }

  /**
   * Gives the number of entries of the stack.
   *
   * @returns The height of the stack.
   */
  get height (): number {
    return this.stack.length
  }

  /**
   * Verifies the existence of a particular middleware in the stack.
   *
   * @param middleware - A middleware name.
   * @returns An indicator that the middleware has or has not been added to
   * the stack.
   */
  has (middleware: string | Middleware<Request, Response, Input, Output, Context>): boolean {
    const name = typeof middleware !== 'string' ? middleware.name : middleware
    return this.names.has(name)
  }

  /**
   * Adds the middleware name to the local cache of middleware for quicker middleware
   * validation.
   *
   * @param name - A middleware name to cache to check for name uniqueness on
   * the stack.
   * @param silent - An option to make this method go "BOOM!"
   * @returns An indicator that the name was successfully added to stack or
   * that it already exists.
   */
  protected cache (name: string, silent = true): boolean {
    if (this.has(name)) {
      if (silent) return false
      throw Error(`A middleware with the name ${name} already exists.`)
    }
    this.names.add(name)
    return true
  }

  /**
   * Adds middleware to the stack according to its step and priority.
   *
   * @param middleware - An absolute
   * middleware to add to the stack.
   * @returns A reference to this instance.
   */
  useAbsolute (middleware: AbsoluteMiddleware<Request, Response, Input, Output, Context>): this {
    this.cache(middleware.name, false)
    this.stack.push(middleware)
    return this
  }

  /**
   * Creates the middleware and adds it to the stack according to its step and priority.
   *
   * @param fn - An absolute middleware function to add to the stack.
   * @param options - Additional information to sort the absolute middleware in the
   * correct position.
   * @returns A reference to this instance.
   */
  createAbsolute (
    fn: MiddlewareFunction<Request, Response, Input, Output, Context> | AbsoluteMiddleware<Request, Response, Input, Output, Context>,
    options?: AbsoluteMiddlewareOptions
  ): this {
    const middleware = !isAbsoluteMiddleware(fn) ? AbsoluteMiddlewareFactory(fn, options) : fn
    return this.useAbsolute(middleware)
  }

  /**
   * Adds middleware to the stack relative to the anchoring middleware. If the
   * anchoring middleware does not exist, the middleware will be ignored during the
   * sorting process.
   *
   * @param middleware - A relative middleware to add to the stack.
   * @returns A reference to this instance.
   */
  useRelative (middleware: RelativeMiddleware<Request, Response, Input, Output, Context>): this {
    this.cache(middleware.name, false)
    this.stack.push(middleware)
    return this
  }

  /**
   * Creates the middleware and adds it to the stack relative to the anchoring
   * middleware.
   *
   * @param fn - A relative middleware function to add to the stack.
   * @param options - Additional information to sort the relative middleware in the
   * correct position.
   * @returns A reference to this instance.
   */
  createRelative(
    fn: MiddlewareFunction<Request, Response, Input, Output, Context> | RelativeMiddleware<Request, Response, Input, Output, Context>,
    options: RelativeMiddlewareOptions
  ): this {
    const middleware = !isRelativeMiddleware(fn) ? RelativeMiddlewareFactory(fn, options) : fn
    return this.useRelative(middleware)
  }

  /**
   * Add a middleware to the stack.
   *
   * @param middleware - A relative or absolute
   * middleware to add to the stack.
   * @returns The reference to this instance.
   */
  use (middleware: Middleware<Request, Response, Input, Output, Context>): this {
    if (isRelativeMiddleware(middleware)) {
      return this.useRelative(middleware)
    }
    if (isAbsoluteMiddleware(middleware)) {
      return this.useAbsolute(middleware)
    }
    return this.createAbsolute(middleware)
  }

  /**
   * Remove deletes a middleware from the stack and cache.
   *
   * @param name - The name of the middleware to remove.
   * @returns The reference to this instance.
   */
  remove (name: string): this {
    const index = this.stack.findIndex(middleware => middleware.name === name)
    this.stack.splice(index, 1)
    this.names.delete(name)
    return this
  }

  /**
   * RemoveByRef deletes the middleware function(s) that have the same reference as
   * the given function.
   *
   * @param ref - The middleware function
   * to remove by reference.
   * @returns The reference to this instance.
   */
  removeByRef (ref: MiddlewareFunction<Request, Response, Input, Output, Context>): this {
    const removed = remove(this.stack, (middleware: MiddlewareFunction<Request, Response, Input, Output, Context>) => middleware === ref)
    for (const middleware of removed) {
      this.names.delete(middleware.name)
    }
    return this
  }

  /**
   * RemoveByTag deletes the middleware function(s) that have the given tag.
   *
   * @param tag - Indicates the middleware to remove by tag.
   * @returns The reference to this instance.
   */
  removeByTag (tag: string): this {
    const removed = remove(this.stack, (middleware: Middleware<Request, Response, Input, Output, Context>) => middleware.tags.includes(tag))
    for (const middleware of removed) {
      this.names.delete(middleware.name)
    }
    return this
  }

  /**
   * Resolve enchains the middleware by binding the next and context parameters and
   * exposing a handler to begin the call chain.
   *
   * @param terminalware - The last middleware to be called
   * in the chain.
   * @param context - A context for sharing data
   * between middleware calls such as a common logger.
   * @returns The first middleware to be called on the
   * middleware stack.
   */
  resolve<I extends Input, O extends Output> (
    terminalware: Terminalware<Request, Response, I, O, Context>,
    context: MiddlewareExecutionContext<Context>
  ): InitializeHandler<Response, I, O> {
    const stack = this.sort()
    let handler = terminalware(context)
    for (const middleware of stack.reverse()) {
      // @ts-expect-error the types here cannot be reasonably inferred
      handler = middleware(handler, context)
    }
    return handler as unknown as InitializeHandler<Response, I, O>
  }

  /**
   * Merge creates a new MiddlewareStack from the entries from *this* middleware stack
   * and those given.
   *
   * @param stack - A middleware stack to
   * merge into the current stack.
   * @returns A new middleware stack with
   * the current and supplied middleware sorted in it.
   */
  merge (stack: Array<Middleware<Request, Response, Input, Output, Context>>): MiddlewareStack<Request, Response, Input, Output, Context> {
    return new MiddlewareStack([...this.stack, ...stack])
  }

  /**
   * Provides a pluggable interface for manipulating this middleware stack instance.
   * It should be used when performing multiple operations on a class instance in a
   * transaction-like manner.
   *
   * @param plugin - A synchronous function
   * called in the context of this instantiated class.
   * @returns The reference to this instance.
   */
  plugin (plugin: Pluggable<Request, Response, Input, Output, Context>): this {
    plugin.call(this)
    return this
  }

  /**
   * Sorts the middleware according to their step, priority, and relation and returns
   * a new array of middleware.
   *
   * @returns A list of middleware sorted
   * according to their step, priority, or relation.
   */
  private sort () {
    const stack: Array<Middleware<Request, Response, Input, Output, Context>> = []
    const relativeMiddleware: RelativeMiddleware<Request, Response, Input, Output, Context>[] = []
    const absoluteMiddleware: AbsoluteMiddleware<Request, Response, Input, Output, Context>[] = []

    // Filter middleware by type.
    for (const middleware of this.stack) {
      if (isRelativeMiddleware(middleware)) {
        relativeMiddleware.push(middleware)
      } else if (isAbsoluteMiddleware(middleware)) {
        absoluteMiddleware.push(middleware)
      }
    }

    // Sort the middleware.
    for (const middleware of absoluteMiddleware) {
      // Find the position for the absolute middleware.
      let index = stack.findIndex(current => {
        // Only compare absolute middleware.
        return hasOwnProperties(current, 'step', 'priority') &&
          // The middleware step is greater than the one that's being inserted
          (current.step > middleware.step  ||
            // The middleware steps are equivalent and the middleware priority is
            // greater than the one being inserted
            (current.step === middleware.step && current.priority > middleware.priority))
      })

      // If index is not found (-1), the element will be placed at the end of the array.
      if (index === -1) index = stack.length

      // Find any middleware with relation to this middleware.
      const before: RelativeMiddleware<Request, Response, Input, Output, Context>[] = []
      const after: RelativeMiddleware<Request, Response, Input, Output, Context>[] = []
      for (const relative of relativeMiddleware) {
        if (relative.toMiddleware !== middleware.name) continue
        if (relative.relation === Relation.BEFORE) before.push(relative)
        else after.push(relative)
      }
      // Insert the middleware with the middleware which is relative to it.
      // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice#parameters
      stack.splice(index, 0, ...before, middleware, ...after)
    }

    // Return a new stack
    return stack
  }
}
