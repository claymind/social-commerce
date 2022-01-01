import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './modules/store';

export default function withReduxContainer(WrappedComponent) {
  const ReduxContainer = () => {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <WrappedComponent />
        </PersistGate>
      </Provider>
    );
  };

  return ReduxContainer;
}
