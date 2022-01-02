import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useAppBridge } from '@shopify/app-bridge-react';
import { Page, TextField, Card } from "@shopify/polaris";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Creators } from '../modules/ducks/shop/shop.actions';
import { getShop } from '../modules/ducks/shop/shop.selectors';

const QUERY_SHOP = gql`
  query {
    shop {
      id,
      name,
      description,
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
  const [fetchShopDetails, { loading: queryLoading, error: queryError, data: queryData }] = useLazyQuery(QUERY_SHOP);
  const [updateSiteName, { data: siteData, loading: mutationLoading, error: mutationError }] = useMutation(UPDATE_SITE_NAME, {
    onError: () => console.log('Error updating Site Name'),
    onCompleted: (data) => onSiteNameUpdate(data)
  });
  const app = useAppBridge();

  useEffect(() => {
    if (!queryData) {
      fetchShopDetails();
    }
  }, []);

  useEffect(() => {
    if (queryData) {
      const { myshopifyDomain } = queryData.shop;
      getShopAction(myshopifyDomain);

      setSiteName(queryData?.shop?.metafield?.value);
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
  };

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

  if (queryLoading) return <div>Loading…</div>;
  if (queryError) return <div>{queryError.message}</div>;

  return (
    <Page>
      {queryData &&  
      <Card primaryFooterAction={{content: 'Save', onAction: () => updateShop() }}>
        <Card.Section>
          <TextField
              label="Social Commerce Site Name"
              type="text"
              name="siteName"
              value={siteName}
              onChange={handleSiteNameChange}
              helpText="for example: Habiliment-RUQGBj"
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
        { shop && 
          <Card.Section>
            <TextField
              label="Claymind ID"
              type="text"
              value={csId}
              disabled 
              autoComplete="off"  
            />
          </Card.Section> 
        } 
        </Card>
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