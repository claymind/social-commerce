import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import shopReducer from './ducks/shop/shop.reducer';

const persistConfig = {
  key: 'root',
  storage
};

const reducers = {
  shop: shopReducer
};

const rootReducer = persistCombineReducers(persistConfig, reducers);

export default (state, action) => {
  if (action.type === 'PURGE_STORE') {
    console.log('store purged!');
    storage.removeItem('persist:primary');
    state = undefined;
  }

  return rootReducer(state, action);
};
