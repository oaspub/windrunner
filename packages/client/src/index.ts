// TODO - Maybe these types are helpful?
// export type OperationRequestBody<T> = T extends TFunction<infer Args>
//   ? Args extends [infer U, infer N, infer A]
//     ? U
//     : never
//   : never
//
// export type OperationParams<T> = T extends TFunction<infer Args>
//   ? Args extends [infer U, infer N, infer A]
//     ? N
//     : never
//   : never
//
// export type OperationQueries<T> = T extends TFunction<infer Args>
//   ? Args extends [infer U, infer N, infer A]
//     ? A
//     : never
//   : never
//
// export type OperationResponse<T> = T extends TFunction<infer Args, infer Returns>
//   ? Returns
//   : never
//
// export type OperationFn<T extends TSchema = TSchema, U extends TSchema = TSchema, N extends TSchema = TSchema, A extends TSchema = TSchema> = TFunction<[T, U, N], A>
