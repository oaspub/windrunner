import {Validator} from "./validator";
import {Operation} from "@windrunner/contract";

export class CommandOutputValidator<T extends Operation> extends Validator<T['Output']> {
    constructor(commandDef: T) {
        super(commandDef.Output)
    }
}
