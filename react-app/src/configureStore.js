import { createStore,
  // applyMiddleware,
  } from 'redux';
import rootReducer from './reducers';
// import { createLogger } from 'redux-logger';

// const loggerMiddleware = createLogger();

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    // applyMiddleware(
    //   loggerMiddleware // neat middleware that logs actions
    // )
  );
};