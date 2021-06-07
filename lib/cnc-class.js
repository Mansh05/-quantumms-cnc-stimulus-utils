import {StateChangeListener} from "./state";

const CncClass = function(element, context) {
	let value = element.dataset.cncClass.split('#')[1]
	let classList = context.classList[value]

	if (classList) {
		let mainObj = context['$cnc']['classes']

		let mainValue = classList['state'];
		let splitter = mainValue.split('.')

		if (splitter.length > 1) {
			mainValue = splitter[0];
		}
		splitter.shift()
		mainObj[mainValue] = mainObj[mainValue] || []
		mainObj[mainValue].push(
			{
				element: element,
				classData: classList,
				check: value,
				mainValue: mainValue,
				splitter: splitter,
				removed: true,
			}
		)

		let _value = context.state[mainValue]
		if (typeof(_value) != 'function' && !context['$cnc']['changes'][mainValue]) {
			context['$cnc']['classes'][mainValue] = true
			StateChangeListener(context, mainValue, _value)
		}
	}
}

export const checkCncClasses = function(context) {
	let states = context.$cnc.classes

	Object.keys(states).forEach(state => {
		if (typeof(context.state[state]) !== 'function') {
			UpdateSingularClassStates(context, context.state[state], state)
		}
	})
}


export const UpdateSingularClassStates = function (context, value, state) {
	// First our own states

	let elements = context.$cnc.classes[state]

	// Only if elements associated to it is there else just run the listeners
	if (elements) {
		// If it is true than add the elments
		elements.forEach(elem => {
			// Check if it is a splitted value

			let mainValue = value

			if (elem.splitter.length > 1) {
				// lets find the value
				for (let i = 0;i<elem.splitter.length;i++) {
					mainValue = value[elem.splitter[i]]
				}
			}

			if (mainValue) {
				// if (elem.removed) {
				// Need to add it to a particular index or next to its siblings
				elem.element.classList.add(elem.classData.className)
				elem.removed = false
				// }
			} else {
				if (!elem.removed) {
					// Only remove if it not removed
					elem.element.classList.remove(elem.classData.className)
					elem.removed = true
				}
			}
		})
	}
}

export default CncClass
