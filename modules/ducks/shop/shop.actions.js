import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions(
  {
    updateStorefront: ['data'],
    updateStorefrontSuccess: [],
    updateStorefrontFailure: ['error'],

    updateStorefrontSubscription: ['subId', 'storefrontId'],
    updateStorefrontSubscriptionSuccess: [],
    updateStorefrontSubscriptionFailure: ['error'],

    getStorefront: ['myshopifyDomain', 'email', 'shopifyId'],
    getStorefrontSuccess: ['data'],
    getStorefrontFailure: ['error'],

  },
  { prefix: '@Storefront/' }
);

export { Types, Creators };
