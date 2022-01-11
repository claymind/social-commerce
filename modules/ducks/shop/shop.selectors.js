import { createSelector } from 'reselect';

const storefrontState = (state) => state.storefront;

export const getStorefront = createSelector([storefrontState], ({ storefront }) => storefront);