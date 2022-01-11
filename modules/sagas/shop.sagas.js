import { call, put, takeLatest } from '@redux-saga/core/effects';
import { Creators, Types } from '../ducks/shop/shop.actions';
import { getStorefront, updateStorefront, updateStorefrontSubscription } from '../../services/shop.service';

export function* updateStorefrontRequest(action) {
  try {
    yield call(updateStorefront, action.data);
    yield put(Creators.updateStorefrontSuccess());
  } catch (error) {
    yield put(Creators.updateStorefrontFailure(error.message));
  }
}

export function* updateStorefrontSubscriptionRequest(action) {
  const { subId, storefrontId } = action;
  try {
    yield call(updateStorefrontSubscription, subId, storefrontId);
    yield put(Creators.updateStorefrontSubscriptionSuccess());
  } catch (error) {
    yield put(Creators.updateStorefrontSubscriptionFailure(error.message));
  }
}

export function* getStorefrontRequest(action) {
  const { myshopifyDomain, email, shopifyId } = action;
  try {
    const result = yield call(getStorefront, myshopifyDomain, email, shopifyId);
    console.log(result);

    /// result is undefined if there is an error
    if (typeof result === 'undefined') throw new Error(error_message);
  

    yield put(Creators.getStorefrontSuccess({ storefront: result }));
  } catch (error) {
    yield put(Creators.getStorefrontFailure(error.message));
  }
}

export default function* shopSagas() {
  yield takeLatest(Types.GET_STOREFRONT, getStorefrontRequest);
  yield takeLatest(Types.UPDATE_STOREFRONT, updateStorefrontRequest);
  yield takeLatest(Types.UPDATE_STOREFRONT_SUBSCRIPTION, updateStorefrontSubscriptionRequest);
}
