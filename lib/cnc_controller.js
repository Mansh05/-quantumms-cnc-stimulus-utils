import { Controller } from 'stimulus'
import CncIf, { checkCncIfs, UpdateSingularIfStates } from "./cnc-if";
import {StateChangeListener} from "./state";
import CncDisabled, {checkCncDisables, UpdateSingularDisablesStates} from "./cnc-disabled";
import CheckListeners, {UpdateSingularListener} from "./cnc-listeners";
import CncClass, {checkCncClasses} from "./cnc-class";
import CncFor, {checkCncFors, UpdateSingularForStates} from "./cnc-for";

class CncController extends Controller {
	clones = {};
	state = {};
	listeners = {};
	classList = {}

	connect() {
		this.beforeConnecting();
		this.connecting();
		this.afterConnecting();
		this.connected();
		this.element.removeAttribute('hidden')
	}

	beforeConnecting() {}

	// THis is a kinda lifecycle hook for connection of app
	afterConnecting() {}

	connecting() {
		this.state = Object.assign(this.state, this.stateInitializer)
		this.setUpCnc();
		this.configureIfs(this);
		this.configureFors(this);
		this.configureDisables(this);
		this.configureClasses(this);
		this.configureListeners(this);
		this.updateStates();
	}

	connected() {}

	updateStates() {
		checkCncIfs(this);
		checkCncDisables(this)
		checkCncClasses(this)
		CheckListeners(this)
		checkCncFors(this)
	}

	setUpCnc() {
		this.$cnc = {
			ifs: {},
			changes: {},
			classes: {},
			disables: {},
			fors: {},
		}
	}

	stateChanged(property, value) {
		UpdateSingularIfStates(this, value, property)
		UpdateSingularForStates(this, value, property)
		UpdateSingularDisablesStates(this, value, property)
		UpdateSingularListener(this, property)
	}

	configureDisables(context) {
		this.elements(context, 'data-cnc-disabled').forEach(node => {
			if (node.dataset.cncDisabled.split('#')[0] == context.element.dataset.controller) {
				CncDisabled(node, this)
			}
		})
	}

	configureIfs(context) {
		this.elements(context, 'data-cnc-if').forEach(node => {
			if (node.dataset.cncIf.split('#')[0] == context.element.dataset.controller) {
				CncIf(node, this);
			}
		});
	}

	configureFors(context) {
		this.elements(context, 'data-cnc-for').forEach(node => {
			if (node.dataset.cncFor.split('#')[0] == context.element.dataset.controller) {
				CncFor(node, this);
			}
		});
	}

	configureClasses(context) {
		this.elements(context, 'data-cnc-class').forEach(node => {
			if (node.dataset.cncClass.split('#')[0] == context.element.dataset.controller) {
				CncClass(node, this);
			}
		});
	}

	configureListeners(context) {
		Object.keys(this.listeners).forEach(listener => {
			if (!this.$cnc.changes[listener]) {
				StateChangeListener(this, listener, this.state[listener])
			}
		})
	}

	elements(context, selector) {
		let select = "[" + selector + "]"
		return context.element.querySelectorAll(select)
	}

	get stateInitializer() {
		return {}
	}
}

export default CncController
