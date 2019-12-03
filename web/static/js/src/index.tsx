import React, {PureComponent} from "react";
import ReactDOM from "react-dom";

import {createStore, applyMiddleware, compose as reduxCompose} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";

import App from "./components/App";
import RootReducer from "./reducers/RootReducer";

const store = createStore(
  RootReducer,
  {}, // initial state
  reduxCompose(
    applyMiddleware(() => next => action => {
      // Lets us use thunk action creators with create-actions
      var isfun = (obj: any) => typeof obj === "function";
      return next(isfun(action.payload) ? action.payload : action);
    }),
    applyMiddleware(thunk)
  )
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
