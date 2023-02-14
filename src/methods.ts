export const METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    PATCH: 'patch',
    DELETE: 'delete'
} as const

export type Method = typeof METHOD[string]
