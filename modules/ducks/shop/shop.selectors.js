import { createSelector } from 'reselect';

const shopState = (state) => state.shop;

export const getShop = createSelector([shopState], ({ shop }) => shop);