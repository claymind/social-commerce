import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useAppBridge } from '@shopify/app-bridge-react';
import { Banner, Page, Link, TextField, Card, FooterHelp, SkeletonPage, SkeletonBodyText } from "@shopify/polaris";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Creators } from '../modules/ducks/shop/shop.actions';
import { getShop } from '../modules/ducks/shop/shop.selectors';

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
  }
`;

const Index = ({getShopAction, shop, updateShopAction}) => {
  const [ csId, setCsId ] = useState(); 
  const [ siteName, setSiteName ] = useState();
  const [ origSiteName, setOrigSiteName] = useState();
  const [ hasError, setHasError ] = useState(false);
  const [ hasResults, setHasResults ] = useState(false);

  const [fetchShopDetails, { loading: queryLoading, error: queryError, data: queryData }] = useLazyQuery(QUERY_SHOP);
  const [updateSiteName, { data: siteData, loading: mutationLoading, error: mutationError }] = useMutation(UPDATE_SITE_NAME, {
    onCompleted: (data) => onSiteNameUpdate(data),
    refetchQueries: [
      QUERY_SHOP, // DocumentNode object parsed with gql
      'fetchShopDetails' // Query name
    ]
  });

  const app = useAppBridge();

  useEffect(() => {
    if (!queryData) {
      fetchShopDetails();
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
    if (shop && shop.length) {
      setCsId(shop[0].id);
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
  };

  if (queryLoading) return <SkeletonPage>
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
        loading: mutationLoading ,
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
        { mutationError && <Banner status="critical">{mutationError.message}</Banner> }
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