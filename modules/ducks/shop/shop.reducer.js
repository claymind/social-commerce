import { createReducer } from 'reduxsauce';
import { Types } from './shop.actions';

const INITIAL_STATE = {
  storefront: null
};

export default createReducer(INITIAL_STATE, {
  [Types.GET_STOREFRONT]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: true
    };
  },
  [Types.GET_STOREFRONT_SUCCESS]: (state, action) => {
    const { storefront } = action.data;
    return {
      ...state,
      error: null,
      isFetching: false,
      storefront
    };
  },
  [Types.GET_STOREFRONT_FAILURE]: (state, action) => {
    return {
      ...state,
      error: action.error,
      isFetching: false,
      storefront: null
    };
  },
  [Types.UPDATE_STOREFRONT]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: true
    };
  },
  [Types.UPDATE_STOREFRONT_SUCCESS]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: false
    };
  },
  [Types.UPDATE_STOREFRONT_FAILURE]: (state, action) => {
    return {
      ...state,
      error: action.error,
      isFetching: false
    };
  },

  [Types.UPDATE_STOREFRONT_SUBSCRIPTION]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: true
    };
  },
  [Types.UPDATE_STOREFRONT_SUBSCRIPTION_SUCCESS]: (state) => {
    return {
      ...state,
      error: null,
      isFetching: false
    };
  },
  [Types.UPDATE_STOREFRONT_SUBSCRIPTION_FAILURE]: (state, action) => {
    return {
      ...state,
      error: action.error,
      isFetching: false
    };
  },
});
