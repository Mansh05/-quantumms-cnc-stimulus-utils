import {StateChangeListener} from "./state";
import {DirectiveParser} from "./parser";

const CncFor = function(element, context) {
	let dataset = element.dataset
	let value = dataset.cncFor.split('#')[1]

	let mainValue = value;

	let mainObj = context['$cnc']['fors']
	mainObj[mainValue] = mainObj[mainValue] || []
	mainObj[mainValue].push(
		{
			parent: element.parentElement,
			childElement: element.children[0],
			element: element,
			check: value,
			mainValue: mainValue,
			dataset: dataset
		}
	)
	let _value = context.state[mainValue].value

	if (typeof(_value) != 'function' && !context['$cnc']['changes'][mainValue]) {
		context['$cnc']['changes'][mainValue] = true
		StateChangeListener(context, mainValue, _value)
	}

	element.children[0].remove();
}

export const checkCncFors = function(context) {
	let states = context.$cnc.fors

	Object.keys(states).forEach(state => {
		UpdateSingularForStates(context, context.state[state], state)
	})
}


export const UpdateSingularForStates = function (context, value, state) {
	// First our own states

	let elements = context.$cnc.fors[state]

	// Only if elements associated to it is there else just run the listeners
	if (elements) {
		// If it is true than add the elments
		elements.forEach(elem => {
			// Check if it is a splitted value

			let mainValue = value

			elem.element.innerHTML = '';

			if (mainValue.value) {
				mainValue = mainValue.value
			}

			mainValue.forEach((val, index) => {
				if (elem.element.children[index]) {
					elem.element.children[index].remove();
				}

				let newNode = elem.childElement.cloneNode(true)

				let id = state + "-" + index + "-for" + newNode.dataset.parentName
				newNode.id = id
				newNode.dataset['IndexCount'] = index

				newNode.querySelectorAll("[" + 'data-form' + "]").forEach(element => {
					let formSet = JSON.parse(element.dataset.form)
					if (formSet.controller === state) {
						formSet.name = id;
						element.dataset.form = JSON.stringify(formSet)
					}
				})

				newNode.querySelectorAll("[" + 'data-index-count' + "]").forEach(element => {
					element.dataset.indexCount = index
				})

				newNode.querySelectorAll("[" + 'data-parent-name' + "]").forEach(element => {
					element.dataset.parentName = id
				})

				elem.element.appendChild(newNode)
			});
		})
	}
}

export default CncFor
