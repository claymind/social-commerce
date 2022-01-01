import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from "@apollo/client";
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
      primaryDomain {
        id
      },
      myshopifyDomain,
      id,
      billingAddress {
        formatted,
        firstName,
        lastName,
        name,
        company,
        phone
      }
    }
  }
`;

const Index = ({getShopAction, shop, updateShopAction}) => {
  const [ cShopId, setCshopId ] = useState();
  const [ cShopSiteName, setCshopSiteName] = useState('');
  const [fetchShopDetails, { loading, error, data }] = useLazyQuery(QUERY_SHOP);
  const app = useAppBridge();

  useEffect(() => {
    if (!data) {
      fetchShopDetails();
    }
  }, []);

  useEffect(() => {
    if (data) {
      const { myshopifyDomain } = data.shop;
      getShopAction(myshopifyDomain);
    }
  }, [data]);


  useEffect(() => {
    //store cShop data to state 
    if (shop && shop.length) {
      setCshopId(shop[0].id);
      setCshopSiteName(shop[0].siteName);
    }
  }, [shop]);

  const handleSiteNameChange = value => {
    setCshopSiteName(value);
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>{error.message}</div>;

  const updateShop = () => {
    updateShopAction({id: cShopId, siteName: cShopSiteName });
  };

  return (
    <Page>
      <Card primaryFooterAction={{content: 'Save', onAction: () => updateShop() }}>
        <Card.Section>
          <TextField
              label="Social Commerce Site Name"
              type="text"
              name="siteName"
              value={cShopSiteName}
              onChange={handleSiteNameChange}
              helpText="for example: Habiliment-RUQGBj"
          />
        </Card.Section>
      </Card>
      {data && data.shop && shop && 
      <Card>
        <Card.Section>
          <TextField
            label="Name"
            type="text"
            name="name"
            value={data.shop.name}
            disabled 
            autoComplete="off"
          />
        </Card.Section>
        <Card.Section>
          <TextField
            label="Email"
            type="text"
            name="email"
            value={data.shop.email}
            disabled 
            autoComplete="off"
          />
        </Card.Section>
        <Card.Section>
          <TextField
            label="MyShopify Domain"
            type="text"
            name="myshopifyDomain"
            value={data.shop.myshopifyDomain}
            disabled 
            autoComplete="off"
          />
        </Card.Section>
      </Card>
      }
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