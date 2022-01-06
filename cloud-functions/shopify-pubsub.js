const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'social-commerce-5e155';

const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true
});

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.shopifyPubSub = async (event, context) => {
  if (event.attributes && event.attributes["X-Shopify-Shop-Domain"]) {
    const shopsRef = firestore.collection('shops');
    const shopifyDomain = event.attributes["X-Shopify-Shop-Domain"];

    console.log(`My Shopify Domain: ${shopifyDomain}`);
    const query = shopsRef.where('myshopifyDomain', '==', shopifyDomain);
    const querySnapshot = await query.get();
 
    if (!querySnapshot.empty) {
      const queryDocumentSnapshot = querySnapshot.docs[0];

      queryDocumentSnapshot.ref.update({
        isInstalled: false,
        uninstallDate: new Date()
      })
      .then(doc => {
        console.info('updated doc id#', doc.id);
      }).catch(err => {
        throw new Error(err);
      });    
    }
  }  
}
