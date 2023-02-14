import { Contract } from '@windrunner/contract'
import { WebServerController } from '../controller'
import {
    DeserializeHandler,
    DeserializeHandlerArguments,
    DeserializeHandlerOutput,
    Request,
    Response
} from './middleware'

export function terminalware<T extends Contract<any>>(contract: T, controller: WebServerController<T>): DeserializeHandler<Request, Response> {
    /** TODO - pass in and invoke the callback function */
    const callback = async (...args: unknown[]): Promise<any> => { return 1 }
    return async (args: DeserializeHandlerArguments<Request>): Promise<DeserializeHandlerOutput<Response>> => {
        const response = await callback(args.request)
        return { response }
    }
}
