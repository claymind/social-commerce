const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const host = JSON.stringify(process.env.SHOPIFY_APP_URL);
// Content-Security-Policy: frame-ancestors https://example.myshopify.com https://admin.shopify.com;

const securityHeaders = [{
  key: 'Content-Security-Policy',
  value: `frame-ancestors https://*.myshopify.com https://admin.shopify.com`
}];

module.exports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  env: {
    REACT_APP_FIREBASE_AUTH_DOMAIN: 'social-commerce-5e155.firebaseapp.com',
    REACT_APP_FIREBASE_PROJECT_ID: 'social-commerce-5e155',
    REACT_APP_FIREBASE_STORAGE_BUCKET: 'social-commerce-5e155.appspot.com',
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '865332277984',
    REACT_APP_FIREBASE_APP_ID: '1:865332277984:web:45a6f86be89e0c788c5685',
    REACT_APP_MEASUREMENT_ID: 'G-4KF9NRSCQH',
    REACT_APP_FIREBASE_API_KEY: 'AIzaSyBuoLJFviv42qUZS2PsyMrR3oxp-BSnCmg'
  },
  productionBrowserSourceMaps: true,
  publicRuntimeConfig: {
    apiKey: process.env.SHOPIFY_API_KEY,
    hostUrl: process.env.SHOPIFY_APP_URL
  },
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST_URL: host };
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};
