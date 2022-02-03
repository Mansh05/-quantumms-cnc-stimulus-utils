import { Subject } from 'rxjs'

const validateForm = (validators, object) => {
	object.errors = {};
	let validity = true;
	validators.forEach(validator => {
		const valid = validator(object);
		if (valid) {
			object.errors = { ...object.errors, ...valid };
			validity = false;
		}
	});
	return validity;
};

// This is the abstract resource that will work with all the other types of
// resources
export class AbstractResource {
	_value;
	_errors;
	_childrenValidity = {};
	reference = null;
	stateManager;
	controller;
	name;
	_valid = false;
	_touched = false;
	validators = [];
	valueChanges = new Subject();
	statusChanges = new Subject();
	stateChanged = new Subject();

	options = {
		change: (event) => {
			this.onChange(event)
		},
		keyup: () => {
			this.onChange(event)
		},
		keypress: () => {
			this.onChange(event)
		},
		blur: (event) => {
			this.onTouch(event)
		}
	};

	onChange(event) {
		if (event && event.currentTarget) {
			this.setValue(event.currentTarget.value);
			this.changeStatus();
		}
	}

	setValue(value) {
		this.value = value;
		this.updateValidators();
		this.reference.value = value;
		this.valueChanges.next(value);
	}

	changeStatus() {
		this.statusChanges.next(true);
		if (this._parent) {
			this._parent.onTouch({});
		}
	}

	touchChildren() {
		// Make a deep recursive one
		Object.values(this.controls).forEach(control => {
			control.onTouch();
		});
	}

	// Add multiple new validators
	addValidator(validator) {
		if (validator instanceof Array) {
			this.validators = this.validators.concat(validator);
		} else {
			this.validators.push(validator);
		}
	}

	// Remove all validators
	removeValidators() {
		this.validators = []
		this.updateValidators();
	}

	updateValidators(validChild = true) {
		let validity = this.valid
		this.valid = !this.checkChildValidity() && validChild && validateForm(this.validators, this);
		if (this._parent) {
			this._parent._childrenValidity[this.name] = this.valid;
			this._parent.updateValidators();
		}
		if (this.valid !== validity) {
			this.stateChanged.next(this.valid);
		}
	}

	checkChildValidity() {
		if (!this._childrenValidity) return true

		return Object.values(this._childrenValidity).some(vo => !vo)
	}

	checkParentsValidations() {
		return Object.values(this._parent._childrenValidity).some(vo => !vo)
	}

	onTouch(event, value = true) {
		this.touched = value;
		this.changeStatus();
		if (!this.valid) {
			this.stateChanged.next(this.valid)
		}
	}

	setOnlyValues(value) {
		this.value = value;
		this.updateParent();
	}

	patchValue(value, name) {
		this._value[name] = value;
		this.updateParent();
		this.valueChanges.next(this.value);
		this.statusChanges.next(false);
	}

	updateParent() {
		if (this._parent) {
			this._parent.patchValue(this.value, this.name);
		} else {
			this.statusChanges.next(true);
		}
	}

	setReference(reference) {
		this.reference = reference;
		if (!this.value) {
			this.setOnlyValues(reference.value)
		} else {
			reference.value = this.value
		}
	}

	get(name) {
		return this.controls[name];
	}

	updateState(type) {
		if (this.stateManager) {
			this.stateManager(type, this[type]);
		}
	}

	set errors(value) {
		this._errors = value;
		this.updateState('errors');
	}

	get errors() {
		return this._errors;
	}

	set parent(parent) {
		this._parent = parent;
	}

	get value() {
		return this._value;
	}

	set value(new_val) {
		this._value = new_val
		this.updateState('value');
	}

	get valid() {
		return this._valid;
	}

	set valid(new_val) {
		this._valid = new_val;
		this.updateState('valid');
	}

	get touched() {
		return this._touched;
	}

	set touched(new_val) {
		this._touched = new_val;
		this.updateState('touched');
	}
}

export class ControlResource extends AbstractResource {
	_parent;

	constructor(val = null, parent = null, name) {
		super();
		this._parent = parent;
		this.name = name;
		this.setOnlyValues(val);
	}

	setValue(value) {
		this._touched = true;
		this.setOnlyValues(value);
		this.updateValidators();
		this.reference.value = value
		this.valueChanges.next(value);
	}
}

export class GroupResource extends AbstractResource {
	_parent;
	controls = {};

	constructor(val = {}, parent = null, name) {
		super();
		this._parent = parent;
		this.name = name;
		this.setOnlyValues(val);
	}

	setControl(name, type, value) {
		this.controls[name] = new type(value, this, name);
		return this.controls[name];
	}

	setConstructedControl(name, control) {
		control._parent = this;
		control.name = name
		control.setOnlyValues(control.value)
		this.controls[name] = control
	}
}

export class ArrayResource extends AbstractResource {
	_parent;
	length = 0;
	controls = {};

	constructor(val = [], parent, name) {
		super();
		this._parent = parent;
		this.name = name;
		this.setOnlyValues(val);
	}

	setControl(value, type) {
		this.updateLength(new type(value, this, this.length.toString()));
		return this.controls[(this.length - 1).toString()];
	}

	get array_controls() {
		return Object.values(this.controls);
	}

	updateLength(value) {
		this.controls[this.length.toString()] = value;
		this.length++;
	}

	push(control) {
		this.updatePushedData(control);
		control.updateParent();
		this.updateNewControlValidation(control);
	}

	concat(controls) {
		controls.forEach(control => {
			this.updatePushedData(control);
			control.updateParent();
		});
	}

	updateNewControlValidation(control) {
		this._childrenValidity[control.name] = control.valid
		this.updateValidators();
	}

	updatePushedData(control) {
		control.name = this.length.toString();
		control.parent = this;
		this.updateLength(control);
	}

	updateNewIndexes(index) {
		if (this.length && index !== this.length) {
			for(let i = index; i < this.length; i++ ) {
				this.controls[i] = this.controls[i + 1]
				this.controls[i].name = i
				delete this.controls[i + 1]
			}
		}
	}

	removeAt(index) {
		delete this.controls[index];
		this.length--;
		this.value.splice(index, 1);
		this.updateNewIndexes(index)
		this.updateParent();
		delete this._childrenValidity[index]
		this.updateValidators();
	}
}
