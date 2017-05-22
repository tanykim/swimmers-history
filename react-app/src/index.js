import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
// import { HashRouter as Router, Route } from 'react-router-dom';
import configureStore from './configureStore';
import App from './containers/App';
// import Intro from './containers/Intro';
// import Vis from './containers/Vis';

import './index.css';

const store = configureStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);


        // <Route path="/:gender/:events:/:races:/:names" component={Vis}/>

