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
				UpdateSingularIfStates(context, context.state[listener](context, context.$cnc.ifs[listener].options), listener);
			}

			if (context.$cnc.disables[listener]) {
				UpdateSingularDisablesStates(context, context.state[listener](context, context.$cnc.disables[listener]), listener)
			}

			if (context.$cnc.classes[listener]) {
				UpdateSingularClassStates(context, context.state[listener](context, context.$cnc.classes[listener].element), listener)
			}
		});
	}
}

export default CheckListeners
