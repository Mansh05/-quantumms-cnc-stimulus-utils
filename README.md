# Quantumms Stimulus Utilities
This is a package which serves stimulas js in rails and any other projects which uses stimuas.
This documentation will strictly follow Hotwire rails convention.

# Installing the package

```bash
yarn add @quantumms/cnc-stimulus-utils
 OR
npm install @quantumms/cnc-stimulus-utils
```



# Forms
This can be brought as single package through @quantumms/cnc-stimulus-forms
After installing the package you need to register two of its controllers
which will help in building.

in File /app/javascript/controllers/index.js
```js
import { FormsController } from '@quantumms/cnc-stimulus-forms'
import { ControlsController } from '@quantumms/cnc-stimulus-forms'

application.register('forms', FormsController)
application.register('controls', ControlsController)
```

## Lets create a projects controller
This controller will initiate a form and then based on it we can set controls

projects_controller.js
```js
import { FormsController } from '@quantumms/cnc-stimulus-forms'

// The class should inherit forms controller
export default class extends FormsController {

  	// We need to execute buildform for formscontrolelr to
	// be able to create the form based on buildReference
	// method.
	connect() {
		this.buildForm();
		this.listen();
	}

	listen() {
	  	// The stateChange subject can be observed to see
		// whether the form has been invalidated or validated
		this.form.get('email').stateChanged.subscribe(valid => {
		  // The setValue attribute will update the value of an
			// other controller that we want to for the form
		  this.form.get('name').setValue('dd');
		})

		// The valueChages attribute can observe values changed for
		// that particular control and we can run multiple actions
		this.form.get('name').valueChanges.subscribe(value => {
		})
	}

	// This get method is required to give the reference
	// to the the form we want
	// And additional validators_reference needs to be added to
	// add multiple validations. If we just pass validators_reference
	// as an empty object, it will set required validation to all the controls
	// All the controls will have multiple attributes to play with
	get buildReference() {
		return {
			email: null,
			name: null,
			validators_reference: {}
		}
	}
}
```

In the above controller
The form will build two different controllers named
1. email
2. name

## Referencing the form controller with our own controller
```html
<div data-controller="projects" id="projects-first">
	<%= render :partial => 'granulars/text_field', :locals => { control: 'email', form: { name: 'projects-first', controller: 'projects' } } %>

	<input
		type="text"
		data-controller="controls"
		data-form-control="name"
        data-action="
	        blur->controls#update
	        change->controls#update
	        keyup->controls#update
	    "
	    data-form="<%= { name: 'projects-first', controller: 'projects' } }.to_json %>"
	/>
</div>
```

In the above example we create partial of a text field so that we make granular components and keep our code
clean.

In there we need to pass few attributes that we need to pass
1. data-controller: needs to be controls
2. data-form-control: The name of the control based on the controls
provided in the form as mentioned in the projects controller.

app/views/granulars/text_field.html.erb
```html
<input
	type="text"
	data-controller="controls"
	data-form-control="<%= control %>"
	data-action="
	  blur->controls#update
	  change->controls#update
	"
	data-form="<%= form.to_json %>"
/>
```

Than thats it.

TODO: Each use case that we can handle with different kinds of methods
present in the form.
