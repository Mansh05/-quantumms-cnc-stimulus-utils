import CncController from '../cnc_controller';
import { FormBuilder } from './form_builder';

class FormsController extends CncController {
	form;
	children;
	state = {};
	listeners = {};

	afterConnecting() {
		this.buildForm();
		this.state['valid'] = this.form.valid
		this.form.stateManager = this.stateUpdater
		this.form.controller = this;
	}

	stateUpdater(property, value) {
		if (property === 'valid') {
			this.controller.state['valid'] = value;
			this.controller.stateChanged(property, value)
		}
	}

	buildForm() {
		this.form = new FormBuilder(this.buildReference, 'root')
	}

	get buildReference() {
		return {};
	}
}

export default FormsController
