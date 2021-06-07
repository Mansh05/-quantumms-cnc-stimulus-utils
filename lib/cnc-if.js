import {StateChangeListener} from "./state";
import {DirectiveParser} from "./parser";

const CncIf = function(element, context) {
	let value = element.dataset.cncIf.split('#')[1]

	if (value === 'false') {
		element.remove();
	} else if (value !== 'true') {
		// cache all the elements here
		// Split all the . operator if checking for inner objects
		let mainValue = value;
		let splitter = value.split('.')

		if (splitter.length > 1) {
			mainValue = splitter[0];
		}

		let mainObj = context['$cnc']['ifs']
		mainObj[mainValue] = mainObj[mainValue] || []
		splitter.shift()
		mainObj[mainValue].push(
			{
				parent: element.parentElement,
				nextSibling: element.nextElementSibling,
				element: element,
				removed: false,
				check: value,
				mainValue: mainValue,
				splitter: splitter
			}
		)
		let _value = context.state[mainValue]

		if (typeof(_value) != 'function' && !context['$cnc']['changes'][mainValue]) {
			context['$cnc']['changes'][mainValue] = true
			StateChangeListener(context, mainValue, _value)
		}
	}
}

export const checkCncIfs = function(context) {
	let states = context.$cnc.ifs

	Object.keys(states).forEach(state => {
		if (typeof(context.state[state]) !== 'function') {
			UpdateSingularIfStates(context, context.state[state], state)
		}
	})
}


export const UpdateSingularIfStates = function (context, value, state) {
	// First our own states

	let elements = context.$cnc.ifs[state]

	// Only if elements associated to it is there else just run the listeners
	if (elements) {
		// If it is true than add the elments
		elements.forEach(elem => {
			// Check if it is a splitted value

			let mainValue = DirectiveParser(value, elem)

			if (mainValue) {
				if (elem.removed) {
					// Need to add it to a particular index or next to its siblings
					if (elem.nextSibling && elem.nextSibling.parent) {
						elem.parent.insertBefore(elem.element, elem.nextSibling)
					} else {
						elem.parent.appendChild(elem.element)
					}
					elem.removed = false
					elem.element = 'visible';
				}
			} else if(!elem.removed) {
				// Only remove if it not removed
				removeElement(elem);
			}
		})
	}
}

const removeElement = function(data) {
	// let newElem = data.element.cloneNode(true)
	data.removed = true;
	data.element.remove();
	// data.element = newElem
}

export default CncIf
