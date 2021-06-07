import { UpdateSingularIfStates } from "./cnc-if";
import { UpdateSingularDisablesStates } from "./cnc-disabled";
import {UpdateSingularClassStates} from "./cnc-class";

const CheckListeners = function (context) {
	Object.keys(context.listeners).forEach(listener => {
		UpdateSingularListener(context, listener);
	})
}

export const UpdateSingularListener = function (context, state) {
	if (context.listeners[state]) {
		context.listeners[state].forEach(listener => {
			// check ifs
			if (context.$cnc.ifs[listener]) {
				UpdateSingularIfStates(context, context.state[listener](context), listener);
			}

			if (context.$cnc.disables[listener]) {
				UpdateSingularDisablesStates(context, context.state[listener](context), listener)
			}

			if (context.$cnc.classes[listener]) {
				UpdateSingularClassStates(context, context.state[listener](context), listener)
			}
		});
	}
}

export default CheckListeners
