import { createReducer } from 'reduxsauce';
import { Types } from './shop.actions';

const INITIAL_STATE = {
  shop: null
};

export default createReducer(INITIAL_STATE, {
  [Types.GET_SHOP]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: true
    };
  },
  [Types.GET_SHOP_SUCCESS]: (state, action) => {
    const { shop } = action.data;
    return {
      ...state,
      error: null,
      isFetching: false,
      shop
    };
  },
  [Types.GET_SHOP_FAILURE]: (state, action) => {
    return {
      ...state,
      error: action.error,
      isFetching: false,
      shop: null
    };
  },
  [Types.UPDATE_SHOP]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: true
    };
  },
  [Types.UPDATE_SHOP_SUCCESS]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: false
    };
  },
  [Types.UPDATE_SHOP_FAILURE]: (state, action) => {
    return {
      ...state,
      error: action.error,
      isFetching: false
    };
  },
});
