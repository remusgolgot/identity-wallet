/**
 * Created by vladtomsa on 26/09/2018
 */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import createHistory from 'history/createBrowserHistory';
import thunk from 'redux-thunk';
import administrationReducer from 'reducers/administration';
import attributesReducer from 'reducers/attributes';
import authReducer from 'reducers/auth';
import blockchainAccountReducer from 'reducers/blockchainAccount';
import chatReducer from 'reducers/chat';
import globalReducer from 'reducers/global';
import identityUseReducer from 'reducers/identityUse';
import invitationsReducer from 'reducers/invitations';
import notariesReducer from 'reducers/notaries';
import notificationReducer from 'reducers/notification';
import providerReducer from 'reducers/provider';
import providersReducer from 'reducers/providers';
import sanctionsReducer from 'reducers/sanctions';
import subscriptionsReducer from 'reducers/subscriptions';

export const history = createHistory();

export const rootReducer = combineReducers({
  form: formReducer,
  router: routerReducer,
  admin: administrationReducer,
  attributes: attributesReducer,
  auth: authReducer,
  blockchainAccount: blockchainAccountReducer,
  chat: chatReducer,
  global: globalReducer,
  identityUse: identityUseReducer,
  invitations: invitationsReducer,
  notaries: notariesReducer,
  notification: notificationReducer,
  provider: providerReducer, // used for provider user administration
  providers: providersReducer, // used for simple users
  sanctions: sanctionsReducer,
  subscription: subscriptionsReducer,
});

export default function configureStore(initialState) {
  const routeMiddleware = routerMiddleware(history);

  const middlewares = [
    thunk,
    routeMiddleware,
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          shouldHotReload: false, // Prevent recomputing reducers for `replaceReducer`
      })
      : compose;
  /* eslint-enable */

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(...enhancers)
  );

  return store;
}
