import CncController from '../cnc_controller';

class ControlsController extends CncController {
	control;
	state = {};
	listeners = {};
	classList = {}

	beforeConnecting() {
		this.getForm();
	}

	getForm() {
		let reference = this.application.getControllerForElementAndIdentifier(this.parentElement, this.formData.controller)
		let element = this.element;
		if (!this.element.dataset.formControl) {
			element = this.element.querySelector("[data-form-control]")
		}
		this.setControl(reference, element);
		this.control.setReference(element)
		this.control.stateManager = this.stateUpdater
		this.control.controller = this;
	}

	setControl(reference, element) {
		let dataset = element.dataset
		if (this.formData.hierarchy) {
			let split = dataset.formControl.split('.')
			let control = reference.form
			split.forEach(vo => {
				control = control.get(vo)
			})
			this.control = control
		} else {
			this.control = reference.form.get(dataset.formControl)
		}
	}

	stateUpdater(property, value) {
		this.controller.state[property] = value;
		this.controller.stateChanged(property, value)
	}

	update(data) {
		this.control.options[data.type](data)
	}

	get formData() {
		return JSON.parse(this.element.dataset.form)
	}

	get parentElement() {
		return document.getElementById(this.formData.name)
	}

	get stateInitializer() {
		return {
			value: this.control.value,
			errors: this.control.errors || {},
			valid: this.control.valid,
			touched: this.control.touched
		}
	}
}

export default ControlsController
