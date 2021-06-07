export const DirectiveParser = (value, elem) => {
	let mainValue = value

	if (elem.splitter.length > 1) {
		// lets find the value
		for (let i = 0;i<elem.splitter.length;i++) {
			mainValue = value[elem.splitter[i]]
		}
	}

	return mainValue
}
