import { ApolloClient, HttpLink, ApolloProvider, InMemoryCache } from "@apollo/client";
import App from "next/app";
import getConfig from 'next/config'
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { store, persistor } from '../modules/store';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const app = useAppBridge();
  const fetchOptions = {
    credentials: "include"
  };
  const link = new HttpLink({ fetch: userLoggedInFetch(app), fetchOptions });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

class MyApp extends App {
  componentDidMount() {
    const { publicRuntimeConfig } = getConfig();
    const { Component, pageProps, shop, shopOrigin, host } = this.props;

    if (!host) {
      const SCOPES="read_script_tags,write_script_tags";
      window.top.location = `https://${shopOrigin}/admin/oauth/authorize?client_id=${publicRuntimeConfig.apiKey}&scope=${SCOPES}&redirect_uri=https://socialgallery.claymind.net/auth/callback&state=CLAYMIND&grant_options[]=per-user`;
    }
  }

  render() {
    const { publicRuntimeConfig } = getConfig();
    const { Component, pageProps, shop, shopOrigin, host } = this.props;

    return (
      <AppProvider i18n={enTranslations}>
        <Provider
            config={{
              apiKey: publicRuntimeConfig.apiKey, 
              shopOrigin,
              host,
              forceRedirect: true,
          }}
        >
          <ReduxProvider store={store}>
            <PersistGate persistor={persistor}>
              <MyProvider Component={Component} {...pageProps} shop={shop} host={host} hostUrl={publicRuntimeConfig.hostUrl} />
            </PersistGate>
          </ReduxProvider>
        </Provider>
      </AppProvider>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
    shopOrigin: ctx.query.shop,
  };
};

export default MyApp;
