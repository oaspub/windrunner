/**
 * Checks that certain properties are defined on an object.
 *
 * @param obj - A value to check for own properties.
 * @param keys - A list of properties to check for on the given value.
 * @returns Indicates that the value either has or does not have the given
 * properties.
 */
export function hasOwnProperties<T> (obj: unknown, ...keys: Array<keyof T>): obj is T {
  return keys.every(key => Object.hasOwnProperty.call(obj, key))
}

export type TypeGuard<T> = (value: unknown) => value is T

export type ThrowGuard<T> = (value: unknown) => T | never

/**
 * Creates a type guard that throws a type error instead of returning false when the
 * condition is unmet.
 *
 * @param predicate - A type guard providing that the desired end condition.
 * @param message -  An optional message to supply to the type error.
 * @returns A type guard that throws instead of returning false when
 * the predicate is unfulfilled.
 */
export function Guard<T>(predicate: TypeGuard<T>, message?: string): ThrowGuard<T> {
  return (value: unknown): T | never => {
    if (!predicate(value)) throw TypeError(message)
    return value
  }
}

/**
 * Ensures that a value is not an empty string and throws otherwise.
 */
export const isNotEmptyString = Guard((value: unknown): value is string => typeof value === 'string' && value !== '', 'Value must be a non-empty string')
