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

	addValidator(validator) {
		if (validator instanceof Array) {
			this.validators = this.validators.concat(validator);
		} else {
			this.validators.push(validator);
		}
	}

	updateValidators(validChild = true) {
		let validity = this.valid
		this.valid = validChild && validateForm(this.validators, this);
		if (this._parent) {
			this._parent._childrenValidity[this.name] = this.valid;
			this._parent.updateValidators(!this.checkParentsValidations());
		}
		if (this.valid !== validity) {
			this.stateChanged.next(this.valid);
		}
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
	}

	concat(controls) {
		controls.forEach(control => {
			this.updatePushedData(control);
			control.updateParent();
		});
	}

	updatePushedData(control) {
		control.name = this.length.toString();
		control.parent = this;
		this.updateLength(control);
	}

	removeAt(index) {
		delete this.controls[index];
		this.length--;
		this.value.splice(index, 1);
		this.updateParent();
	}
}
