// import {TObject} from '@sinclair/typebox'
// import * as https from 'https'
// import * as http from 'http'
// import {plural} from 'pluralize'
//
// export interface WindRunnerOptions {
//     protocol?: Protocol.HTTP | Protocol.HTTPS
// }
//
// export class WindRunner<Schema extends TObject> {
//     readonly server: http.Server | https.Server
//
//     constructor(controller: Controller<Schema>, {protocol}: WindRunnerOptions) {
//         const resourceName = controller.schema.$id?.toLowerCase()
//         if (resourceName == null) {
//             throw Error('The controller schema must have an $id specified. The $id should be a descriptive singular noun of the entity it represents.')
//         }
//         const pluralResourceName = plural(resourceName)
//         const keys = controller.keys
//
//         async function handler (request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
//             const url = new URL(request.url, `${protocol}://${request.headers.host}`)
//             const resourcePathRx = new RegExp(`^\/${pluralResourceName}`)
//             const instancePathRx = new RegExp(`^\/${pluralResourceName}/${keys.map(key => `(?<${key}>.+)`).join(',')}`)
//         }
//
//         this.server = protocol === Protocol.HTTP
//             ? http.createServer(handler)
//             : https.createServer(handler)
//     }
//
//     listen(port: number) {
//         this.server.listen(port)
//     }
//
//     close() {
//         this.server.close()
//     }
// }