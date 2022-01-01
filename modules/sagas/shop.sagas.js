import { call, put, takeLatest } from '@redux-saga/core/effects';
import { Creators, Types } from '../ducks/shop/shop.actions';
import { getShop, updateShop } from '../../services/shop.service';

export function* updateShopRequest(action) {
  try {
    yield call(updateShop, action.data);
    yield put(Creators.updateShopSuccess());
  } catch (error) {
    yield put(Creators.updateShopFailure(error.message));
  }
}

export function* getShopRequest(action) {
  const { myshopifyDomain } = action;
  try {
    const result = yield call(getShop, myshopifyDomain);
    console.log(result);

    /// result is undefined if there is an error
    if (typeof result === 'undefined') throw new Error(error_message);
  

    yield put(Creators.getShopSuccess({ shop: result }));
  } catch (error) {
    yield put(Creators.getShopFailure(error.message));
  }
}

export default function* shopSagas() {
  yield takeLatest(Types.GET_SHOP, getShopRequest);
  yield takeLatest(Types.UPDATE_SHOP, updateShopRequest);
}
