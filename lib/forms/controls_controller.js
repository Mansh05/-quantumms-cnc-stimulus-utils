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

		this.control = reference.form.get(element.dataset.formControl)
		this.control.reference = element
		this.control.stateManager = this.stateUpdater
		this.control.controller = this;
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
