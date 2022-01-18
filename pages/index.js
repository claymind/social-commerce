import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from "@apollo/client";
// import { useAppBridge } from '@shopify/app-bridge-react';
import { Banner, EmptyState, TextContainer, Page, Link, TextField, Card, FooterHelp, SkeletonDisplayText, SkeletonPage, SkeletonBodyText } from "@shopify/polaris";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Creators } from '../modules/ducks/shop/shop.actions';
import { getStorefront } from '../modules/ducks/shop/shop.selectors';

const QUERY_SHOP = gql`
  query {
    shop {
      id,
      email,
      myshopifyDomain,
      metafields(first: 2) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
    }
  }
`;

const QUERY_SUBSCRIPTION = gql`
  query getQuerySubscription($id: ID!) {
    node(id: $id) {
      ...on AppSubscription {
        id
        name
        status
        test,
        trialDays
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

const SAVE_SOCIAL_GALLERY_ID = gql`
  mutation SaveSocialGalleryId($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key,
        value,
        updatedAt
      }
    }
  }`;

// const DELETE_SITE_NAME = gql`
// mutation metafieldDelete($input: MetafieldDeleteInput!) {
//   metafieldDelete(input: $input) {
//     userErrors {
//       field
//       message
//     }
//   }
// }`;

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

const Index = ({
  getStorefrontAction, 
  host,
  hostUrl, 
  storeFront, 
  updateStorefrontAction, 
  updateStorefrontSubscriptionAction }) => {

  const [ socialGalleryId, setSocialGalleryId ] = useState();
  const [ shopifyStore, setShopifyStore ] = useState();
  const [ siteName, setSiteName ] = useState();
  const [ origSiteName, setOrigSiteName] = useState();
  const [ hasActiveSubscription, setHasActiveSubscription ] = useState(false);
  const [ hasResults, setHasResults ] = useState(false);

  const [fetchShopDetails, { loading: shopifyShopDataLoading, error: shopifyShopDataError, data: shopifyShopData }] = useLazyQuery(QUERY_SHOP);
  const [fetchShopSubscription, { loading: shopSubscriptionDataLoading, error: shopSubscriptionDataError, data: shopSubscriptionData }] = useLazyQuery(QUERY_SUBSCRIPTION);

  const [updateSiteName, { loading: updateSiteNameLoading, error: updateSiteNameError }] = useMutation(UPDATE_SITE_NAME, {
    onCompleted: (data) => onSiteNameUpdate(data),
    refetchQueries: [
      QUERY_SHOP, 
      'fetchShopDetails' 
    ]
  });

  const [saveSocialGalleryId, { loading: saveSocialGalleryIdLoading, error: saveSocialGalleryIdError, data: saveSocialGalleryIdData }] = useMutation(SAVE_SOCIAL_GALLERY_ID);

  // const [deleteSiteName, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_SITE_NAME, {
  //   refetchQueries: [
  //     QUERY_SHOP, // DocumentNode object parsed with gql
  //     'fetchShopDetails' // Query name
  //   ]
  // });
  const [appSubscribe, { loading: appSubscribeLoading, error: appSubscribeError, data: appSubscriptionData }] = useMutation(APP_SUBSCRIBE, {
    onCompleted: (data) => onAppSubscribed(data)
  });

  //const app = useAppBridge();

  useEffect(() => {
    fetchShopDetails();
  }, []);

  useEffect(() => {
    if (shopifyShopData && shopifyShopData.shop) {
      const { id, email, myshopifyDomain } = shopifyShopData.shop;

      setShopifyStore(shopifyShopData.shop);

      if (shopifyShopData.shop.metafields) {
        const fields = shopifyShopData.shop.metafields;

        const snEdge = fields.edges.find(edge => edge.node.key === "socialCommerceSiteName");
        const sgEdge = fields.edges.find(edge => edge.node.key === "socialGalleryId");

        if (sgEdge) {
          setSocialGalleryId(sgEdge.node.value);
        }

        if (snEdge) {
          setSiteName(snEdge.node.value);
          setOrigSiteName(snEdge.node.value);
        }
      }

      getStorefrontAction(myshopifyDomain, email, id);
    }
  }, [shopifyShopData]);

  useEffect(() => {
    //once claymind shop is retrieved, get ID and subscription ID
    if (storeFront && storeFront.subscriptionId) {
      fetchShopSubscription({ variables: {id: storeFront.subscriptionId}});
    }
  }, [storeFront]);

  useEffect(() => {
    if (shopSubscriptionData) {
      const status = shopSubscriptionData?.node?.status;

      setHasActiveSubscription(status === 'ACTIVE');
    }
  }, [shopSubscriptionData]);

  useEffect(() => {
    if (appSubscriptionData) {
      const { appSubscriptionCreate } = appSubscriptionData;
      //redirect to merchant confirmation screen
      window.top.location = appSubscriptionCreate.confirmationUrl;
    }
  }, [appSubscriptionData]);

  const startFreeTrial = () => {
    subscribeToApp();
  };

  const subscribeToApp = () => {
    appSubscribe({ variables: {
      name: "Social Commerce by Claymind Recurring Plan",
      trialDays: 7,
      returnUrl: `${hostUrl}/?shop=${storeFront.myshopifyDomain}&host=${host}`,
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

  const handleSiteNameChange = value => {
    setSiteName(value);
  };

  const onSiteNameUpdate = (data) => {
    const updatedSiteName = (data?.metafieldsSet?.metafields[0]?.value);
    const updatedAt = (data?.metafieldsSet?.metafields[0]?.updatedAt);
    setSiteName(updatedSiteName);

    //save sitename to db
    updateStorefrontAction({id: storeFront.id, siteName: updatedSiteName, updatedAt});

    setHasResults(true);
  };

  const onAppSubscribed = (data) => {
    if (data.appSubscriptionCreate.appSubscription) {

      //save subscription id and storefront id
      updateStorefrontSubscriptionAction({
        subId: data.appSubscriptionCreate.appSubscription.id, 
        storefrontId: storeFront.id
      });

      //save storefront id in Shopify as social gallery id
      updateSocialGalleryId();
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

  const updateStoreFront = () => {
    if(shopifyStore) {
      updateSiteName({ variables: { metafields: 
        [{
          ownerId: shopifyStore.id,
          namespace: "socialCommerce",
          key: "socialCommerceSiteName",
          value: siteName,
          type: "single_line_text_field"
        }]
      }});
    }

    //deleteSiteName({ variables: { input: { id: "gid://shopify/Metafield/20003811328208" }}});
  };

  const updateSocialGalleryId = () => {
    if(shopifyStore  && storeFront.id) {
      saveSocialGalleryId({ variables: { metafields: 
        [{
          ownerId: shopifyStore.id,
          namespace: "socialCommerce",
          key: "socialGalleryId",
          value: storeFront.id,
          type: "single_line_text_field"
        }]
      }});
    }
  };

  const MainSkeleton = () => (
    <SkeletonPage title="">
      <Card>
        <Card sectioned>
        <TextContainer>
            <SkeletonBodyText lines={4} />
          </TextContainer>
        </Card>
      </Card>

      <Card subdued>
        <Card.Section>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </TextContainer>
        </Card.Section>
        <Card.Section>
        <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </TextContainer>
        </Card.Section>
        <Card.Section>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={2} />
          </TextContainer>
        </Card.Section>
      </Card>
    </SkeletonPage>
  );

  const MainFooter = () => (
    <FooterHelp>
      Learn more about{' '}
      <Link external url="https://www.claymind.com/social-gallery-help">
        using the Social Commercy by Claymind app.
      </Link>
    </FooterHelp>
  );

  if (
    shopifyShopDataLoading || 
    appSubscribeLoading || 
    shopSubscriptionDataLoading || 
    saveSocialGalleryIdLoading) {
      return <MainSkeleton />
    }

  if (!hasActiveSubscription) {
    return  (
      <Page>
        <Card sectioned>
          <EmptyState
            heading="Social Commerce by Claymind"
            action={{content: 'Start Your Free Trial Now', onAction: ()=> startFreeTrial()}}
            image="https://firebasestorage.googleapis.com/v0/b/social-commerce-5e155.appspot.com/o/SocialGalleryIcon-splash-226x226.jpg?alt=media&token=2eadc2e3-33f9-49f8-ace6-ab14042120bb"
            fullWidth
          >
            <p>Connect your store with Social Commerce shoppable galleries!</p>
            <p>
              7-day free trial. $4.99/month after trial. 
            </p>
          </EmptyState>
        </Card>
        <MainFooter />
      </Page>
    )
  }

  return (
    <>
    <Page>
      {shopifyStore && hasActiveSubscription && 
      <>
      <Card
          title="Social Commerce (Curalate) Settings"
          primaryFooterAction={{
            content: 'Save',
            onAction: () => updateStoreFront(),
            loading: updateSiteNameLoading,
            disabled: !isSiteNameDirty() || isSiteNameInvalid()
          }}
        >
          {hasResults &&
            <Card.Section>
              <Banner
                title="Data successfully saved!"
                status="success"
                onDismiss={() => { setHasResults(false); } } 
              />
            </Card.Section>}

            {shopifyShopDataError &&  (
              <Card.Section>
                <Banner status="critical">{shopifyShopDataError.message}</Banner>
              </Card.Section>
            )}

            {shopSubscriptionDataError && (
              <Card.Section>
                <Banner status="critical">{shopSubscriptionDataError.message}</Banner>
              </Card.Section>
            )}

            {updateSiteNameError && (
              <Card.Section>
                <Banner status="critical">{updateSiteNameError.message}</Banner>
              </Card.Section>
            )}
            
            <Card.Section>
              <TextField
                label="Social Commerce Site Name"
                type="text"
                name="siteName"
                value={siteName}
                onChange={handleSiteNameChange}
                helpText="for example: Habiliment-RUQGBj"
                autoComplete="off"
                requiredIndicator={true} />
            </Card.Section>
          </Card>
          <Card title="Account Information" subdued>
            <Card.Section>
              <TextField
                label="Subscription Type"
                type="text"
                name="socialGalleryId"
                value={`${shopSubscriptionData?.node?.name} ${shopSubscriptionData?.node?.trialDays && shopSubscriptionData?.node?.trialDays}-day trial` }
                disabled
                autoComplete="off" />
            </Card.Section>
            <Card.Section>
              <TextField
                label="App User ID"
                type="text"
                name="socialGalleryId"
                value={socialGalleryId}
                disabled
                autoComplete="off" />
            </Card.Section>
            <Card.Section>
              <TextField
                label="MyShopify Domain"
                type="text"
                name="myshopifyDomain"
                value={shopifyStore?.myshopifyDomain}
                disabled
                autoComplete="off" />
            </Card.Section>
          </Card>
        <MainFooter />
        <p></p>
        
        </>
      }
    </Page>
    </>
  );
};

const mapStateToProps = createStructuredSelector({
  storeFront: getStorefront
});

const actions = {
  updateStorefrontAction: Creators.updateStorefront,
  updateStorefrontSubscriptionAction: Creators.updateStorefrontSubscription,
  getStorefrontAction: Creators.getStorefront
};

export default connect(mapStateToProps, actions)(Index);