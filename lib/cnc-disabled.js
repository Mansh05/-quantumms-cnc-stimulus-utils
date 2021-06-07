import {StateChangeListener} from "./state";
import {DirectiveParser} from "./parser";

export const UpdateSingularDisablesStates = function (context, value, state) {
	// First our own states

	let elements = context.$cnc.disables[state]


	if (elements) {
		elements.forEach(elem => {
			let mainValue = DirectiveParser(value, elem)

			elem.element.disabled = !!mainValue
		})
	}
};

const CncDisabled = function(element, context) {
	let value = element.dataset.cncDisabled.split('#')[1]

	if (value === 'true') {
		element.disabled = true
	} else if (value !== 'false') {
		// cache all the elements here
		let mainValue = value;
		let splitter = value.split('.')

		if (splitter.length > 1) {
			mainValue = splitter[0];
		}

		let mainObj = context['$cnc']['disables']
		splitter.shift();
		mainObj[mainValue] = mainObj[mainValue] || []
		mainObj[mainValue].push(
			{
				element: element,
				splitter: splitter,
				check: value,
				mainValue: mainValue
			}
		)
		let _value = context.state[mainValue]

		if (typeof(_value) != 'function' && !context['$cnc']['changes'][mainValue]) {
			context['$cnc']['changes'][mainValue] = true
			StateChangeListener(context, mainValue, _value)
		}
	}
}

export const checkCncDisables = function(context) {
	let states = context.$cnc.disables

	Object.keys(states).forEach(state => {
		if (typeof(context.state[state]) !== 'function') {
			UpdateSingularDisablesStates(context, context.state[state], state)
		}
	})
}

export default CncDisabled
