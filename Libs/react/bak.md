1. React

	1. React.createElement:
		To create an react element. it's immutable. Once you create an element, you can't change its children or attributes.
		Unlike browser DOM elements, React elements are plain objects, and are cheap to create.

			React.createElement(string/component, props, ...children)
		1st arg: string or component.
			string reference to build-in component like <div>.
			component must be Capitalized, correspond to a component defined or imported in your JavaScript file
		
		2nd arg: attribute object
		other args: content

		var element = React.createElement('h1', null, 'Hello World', '!');  // represent DOM tags
		equals to : const element = (<h1>Hello World!</h1>);  // use () to wrapper content to avoid automatic semicolon insertion.

		var elementTwo = (<Welcome name='Felix'/>); // represent user-defined component.

	2. ReactDOM.render: render an element into DOM. most react app call this method once.

		render(reactElement, htmlNode)

			const element = <h1>Hello World</h1>;
			ReactDOM.render(element, document.getElementById('root')); //

2. React.Component: component names should start with a capital letter.

	Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called "props") and return React elements describing what should appear on the screen. 

	Component must return a single root element. 

	functional component:
		function Welcome(props) {
			return <h1>Hello {props.name}</h1>;
		}

	class component:
		class Welcome extends React.Component {
			render() {
				return <h1>Hello, {this.props.name}</h1>
			}
		}

	The above two components are equivalent from React's point of view.

	const element = <Welcome name='Felix'/>;  // call component render function. passing attributes as single object to props


	LifeCycle:

		componentDidMount: after render(), will be called once.
		componentWillUnmount: before component is destoried, called once.

	Controlled Component:



3. Props: are read-only. passed from parent component to child component.

	it must never modify its own props.


4. State: 
	
	it is private and fully controlled by the component. usage for store something in component that is not for visual output.

	*** If you don't use something in render(), it shouldn't be in the state. ***

	this.state = obj;
	this.setState(obj);
	this.setState(fn(preState,props));

	rule for state:
	a. Do Not Modify State Directly

		this.state.comment = 'Hello'; // Wrong
		this.setState({comment: 'Hello'}); // Correct

	b. State Updates May Be Asynchronous

		React may batch multiple setState() calls into a single update for performance.
		Because this.props and this.state may be updated asynchronously, you should not rely on their values for calculating the next state.
		
		// Wrong
		this.setState({
		  counter: this.state.counter + this.props.increment,
		});

		// Correct
		this.setState((prevState, props) => ({
		  counter: prevState.counter + props.increment
		}));

	c. State Updates are Merged


	figure out which one is state. Simply ask three questions about each piece of data:
	1. Is it passed in from a parent via props? If so, it probably isn't state.
	2. Does it remain unchanged over time? If so, it probably isn't state.
	3. Can you compute it based on any other state or props in your component? If so, it isn't state.

5. event

	difference to handling events on DOM elements. 
	a. React events are named using camelCase, rather than lowercase.
	b. With JSX you pass a function as the event handler, rather than a string.
	c. use event.preventDefault() but not return false  to prevent default behavior

	<button onClick={this.handleClick.bind(this)}>
	  Activate Lasers
	</button>

	function(event) {
		event.preventDefault();
	}

	here event is a synthetic event

6. ref and Dom

	the ref callback Attribute: 
		the callback will be executed immediately after the component is mounted or unmounted
		When the ref attribute is used on an HTML element, the ref callback receives the underlying DOM element as its argument.


	<div>
        <form onSubmit = { onSubmitFn }>
            <input ref = { node => input = node }/>  // node is underlying DOM element, it is input element in this case.
            <button type='submit'>Add Todo</button>
        </form>
    </div>

n-3: JSX

	Each JSX element is just syntactic sugar for calling React.createElement(component, props, ...children).

	1. use {} to contain javascript expression, literal stirng using ''.

		const element = (<h1>Hello {name}!</h1>);
		const title = (<h1 className={someClassName}>Hello {name}!</h1>);

	2. attribute should be camelCase

		<h1 className='welcome'>Hello World!</h1>

	3. Spread Attributes

		const props = {firstName: 'Ben', lastName: 'Hector'};
  		return <Greeting {...props} />;  equals to  <Greeting firstName={props.firstName} lastName={props.lastName} />