import { all, fork } from 'redux-saga/effects';
import shopSagas from './shop.sagas';

export default function* rootSaga() {
  yield all([fork(shopSagas)]);
}
