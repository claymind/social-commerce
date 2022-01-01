
import { firestore } from '../firebase-client/firebase-utils';

const shopsRef = firestore.collection('shops');

export const getShop = async (myshopifyDomain) => {
  const query = shopsRef.where('myshopifyDomain', '==', myshopifyDomain);

  try {
    const data = [];
    const querySnapShot = await query.get();
    querySnapShot.forEach((snapshot) => data.push({ id: snapshot.id, ...snapshot.data() }));
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateShop = async (data) => {
  const { id, siteName } = data;
  try {
    const shopRef = firestore.doc(`shops/${id}`);
    await shopRef.update({siteName});
  } catch (error) {
    throw new Error(error);
  }
};
