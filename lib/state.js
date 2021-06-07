// Context is the
export const StateChangeListener = function (context, state, value) {
	let _value = value

	Object.defineProperty(context.state, state, {
		get: function newGetter() {
			return _value
		},
		set: function newSetter(newVal) {
			_value = newVal
			context.stateChanged(state, newVal);
		}
	})
}
