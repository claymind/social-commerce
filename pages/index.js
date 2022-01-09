import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useRouter } from 'next/router'
import { useAppBridge } from '@shopify/app-bridge-react';
import { Banner, Page, Link, TextField, Card, FooterHelp, SkeletonPage, SkeletonBodyText } from "@shopify/polaris";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Creators } from '../modules/ducks/shop/shop.actions';
import { getShop } from '../modules/ducks/shop/shop.selectors';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const QUERY_SHOP = gql`
  query {
    shop {
      email,
      myshopifyDomain,
      metafield(namespace: "socialCommerce", key: "socialCommerceSiteName") {
        id,
        key,
        value
      }
    }
  }
`;

const UPDATE_SITE_NAME = gql`
  mutation UpdateSiteName($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key,
        value,
        updatedAt
      }
    }
  }`;

const DELETE_SITE_NAME = gql`
mutation metafieldDelete($input: MetafieldDeleteInput!) {
  metafieldDelete(input: $input) {
    userErrors {
      field
      message
    }
  }
}`;

const APP_SUBSCRIBE = gql`
mutation appSubscriptionCreate($lineItems: [AppSubscriptionLineItemInput!]!, $name: String!, $returnUrl: URL!, $test: Boolean, $trialDays: Int) {
  appSubscriptionCreate(lineItems: $lineItems, name: $name, returnUrl: $returnUrl, test: $test, trialDays: $trialDays) {
    appSubscription {
      id
    }
    confirmationUrl,
    userErrors {
      field
      message
    }
  }
}`

const Index = ({getShopAction, shop, updateShopAction}) => {
  const router = useRouter()
  const [ csId, setCsId ] = useState(); 
  const [ isCharging, setIsCharging] = useState(false);
  const [ siteName, setSiteName ] = useState();
  const [ origSiteName, setOrigSiteName] = useState();
  const [ hasError, setHasError ] = useState(false);
  const [ hasResults, setHasResults ] = useState(false);

  const [fetchShopDetails, { loading: queryLoading, error: queryError, data: queryData }] = useLazyQuery(QUERY_SHOP);
  const [updateSiteName, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_SITE_NAME, {
    onCompleted: (data) => onSiteNameUpdate(data),
    refetchQueries: [
      QUERY_SHOP, // DocumentNode object parsed with gql
      'fetchShopDetails' // Query name
    ]
  });
  // const [deleteSiteName, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_SITE_NAME, {
  //   refetchQueries: [
  //     QUERY_SHOP, // DocumentNode object parsed with gql
  //     'fetchShopDetails' // Query name
  //   ]
  // });
  const [appSubscribe, { loading: appSubscribeLoading, error: appSubscribeError }] = useMutation(APP_SUBSCRIBE, {
    onCompleted: (data) => onAppSubscribed(data)
  });

  const app = useAppBridge();

  const hasExistingSubscription = () => {
    return true;
  };

  useEffect(() => {
    if (hasExistingSubscription()) {
      if (!queryData) {
        fetchShopDetails();
      } 
    } else {
      if (app) {
      appSubscribe({ variables: {
          name: "Social Gallery Recurring Plan",
          trialDays: 7,
          returnUrl: app.localOrigin, //publicRuntimeConfig.shopifyAppUrl,
          test: true,
          lineItems: [{
            plan: {
              appRecurringPricingDetails: {
                price: { amount: 4.99, currencyCode: "USD" },
                interval: "EVERY_30_DAYS",
              }
            }
          }]
        }});
      }
    }
  }, []);

  useEffect(() => {
    if (queryData) {
      const { email, myshopifyDomain } = queryData.shop;
      getShopAction(myshopifyDomain, email);

      setSiteName(queryData?.shop?.metafield?.value);
      setOrigSiteName(queryData?.shop?.metafield?.value);
    }
  }, [queryData]);

  useEffect(() => {
    //once claymind shop is retrieved, get ID
    if (shop) {
      setCsId(shop.id);
    }
  }, [shop]);

  const handleSiteNameChange = value => {
    setSiteName(value);
  };

  const onSiteNameUpdate = (data) => {
    const updatedSiteName = (data?.metafieldsSet?.metafields[0]?.value);
    const updatedAt = (data?.metafieldsSet?.metafields[0]?.updatedAt);
    setSiteName(updatedSiteName);

    //save to claymind db
    updateShopAction({id: csId, siteName: updatedSiteName, updatedAt});

    setHasResults(true);
  };

  const onAppSubscribed = (data) => {
    if (data.appSubscriptionCreate?.appSubscription && !isCharging) {
      setIsCharging(true);
      window.top.location = data.appSubscriptionCreate.confirmationUrl;
    }
  };

  const isSiteNameDirty = () => {
    if (siteName !== origSiteName) {
      return true;
    }

    return false;
  };

  const isSiteNameInvalid = () => {
    if (!siteName) {
      return true;
    }

    return false;
  }

  const updateShop = () => {
    updateSiteName({ variables: { metafields: 
      [{
        ownerId:  "gid://shopify/Shop/60808593616",
        namespace: "socialCommerce",
        key: "socialCommerceSiteName",
        value: siteName,
        type: "single_line_text_field"
      }]
    }});

    //deleteSiteName({ variables: { input: { id: "gid://shopify/Metafield/20003811328208" }}});
  };

  if (queryLoading || isCharging) return <SkeletonPage>
    <Card>
      <Card sectioned>
          <SkeletonBodyText lines={4} />
      </Card>
    </Card>
    <Card>
      <Card sectioned>
        <SkeletonBodyText lines={2} />
      </Card>
    </Card>
    </SkeletonPage>;

  return (
    <Page>
      {queryData &&  
      <Card 
        primaryFooterAction={{content: 'Save', 
        onAction: () => updateShop(), 
        loading: updateLoading ,
        disabled: !isSiteNameDirty() || isSiteNameInvalid()
      }}
      >
        { hasResults && 
          <Card.Section>
            <Banner
              title="Data successfully saved!"
              status="success"
              onDismiss={() => {setHasResults(false)}}
            />
          </Card.Section>
        } 
        { queryError && <Banner status="critical">{queryError.message}</Banner> }
        { updateError && <Banner status="critical">{updateError.message}</Banner> }
        <Card.Section>
          <TextField
              label="Social Commerce Site Name"
              type="text"
              name="siteName"
              value={siteName}
              onChange={handleSiteNameChange}
              helpText="for example: Habiliment-RUQGBj"
              autoComplete="off"
              requiredIndicator={true} 
          />
        </Card.Section>
      </Card>
      }
        <Card>
          <Card.Section>
            <TextField
              label="MyShopify Domain"
              type="text"
              name="myshopifyDomain"
              value={queryData?.shop?.myshopifyDomain}
              disabled 
              autoComplete="off"
            />
          </Card.Section>
        </Card>
        <FooterHelp>
          Learn more about{' '}
          <Link external url="https://www.claymind.com/social-commerce-help">
            using the Social Commerce Galleries app.
          </Link>
        </FooterHelp>
    </Page>
  );
};

const mapStateToProps = createStructuredSelector({
  shop: getShop
});

const actions = {
  updateShopAction: Creators.updateShop,
  getShopAction: Creators.getShop
};

export default connect(mapStateToProps, actions)(Index);