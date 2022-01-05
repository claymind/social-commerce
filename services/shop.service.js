
import { firestore } from '../firebase-client/firebase-utils';

const shopsRef = firestore.collection('shops');

export const getShop = async (myshopifyDomain, email) => {
  const query = shopsRef.where('myshopifyDomain', '==', myshopifyDomain);

  try {
    const data = [];
    const querySnapShot = await query.get();

    if (querySnapShot.empty) {
      let doc = await shopsRef.add({
        createdAt: new Date(),
        email,
        myshopifyDomain,
        isInstalled: true
      });

      return { id: doc.id, email, myshopifyDomain }
    } else {
      querySnapShot.forEach((snapshot) => data.push({ id: snapshot.id, ...snapshot.data() }));
      return data;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const updateShop = async (data) => {
  const { id, siteName, updatedAt } = data;
  try {
    const shopRef = firestore.doc(`shops/${id}`);

    await shopRef.update({siteName, updatedAt});
  } catch (error) {
    throw new Error(error);
  }
};
