import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions(
  {
    updateShop: ['data'],
    updateShopSuccess: [],
    updateShopFailure: ['error'],

    getShop: ['myshopifyDomain'],
    getShopSuccess: ['data'],
    getShopFailure: ['error'],

  },
  { prefix: '@Shop/' }
);

export { Types, Creators };
