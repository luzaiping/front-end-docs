1. Provider

	Makes the Redux store available to the connect() calls in the component hierarchy below. 
	Normally, you can’t use connect() without wrapping the root component in <Provider>.

	Props:
		store: the single Redux store in application.
		children: the root of your component hierarchy.

	ReactDOM.render(
	  <Provider store={store}>
	    <MyRootComponent />
	  </Provider>,
	  rootEl
	)

	ReactDOM.render(
	  <Provider store={store}>
	    <Router history={history}>
	      <Route path="/" component={App}>
	        <Route path="foo" component={Foo}/>
	        <Route path="bar" component={Bar}/>
	      </Route>
	    </Router>
	  </Provider>,
	  document.getElementById('root')
	)


2. connect()

	Connects a React component to a Redux store. connect is a facade around connectAdvanced, providing a convenient API for the most common use cases.

	[mapStateToProps(state, [ownProps]): stateProps](Function): If specified, the component will subscribed to Redux store updates.Any time updates, mapStateToProps will be called. Its result must be a plain object, and this object will be megered into component's props. If you omit it, the component will not be subscribed to the Redux store. 

	[mapDispatchToProps(dispatch, [ownProps]): dispatchProps](Object or Function): If you omit it, the default implementation just injects 'dispatch' into your component's props.

	[mergeProps(stateProps, dispatchProps, ownProps): props] (Function): If specified, it is passed the result of mapStateToProps(), mapDispatchToProps(), and the parent props. The plain object you return from it will be passed as props to the wrapped component. If you omit it, Object.assign({}, ownProps, stateProps, dispatchProps) is used by default.

	options:

	return A higher-order React component class that passes state and action creators into your component derived from the supplied arguments.


3. connectAdvanced(sessionFactory, [connectOptions])

	Connects a React component to a Redux store. 
