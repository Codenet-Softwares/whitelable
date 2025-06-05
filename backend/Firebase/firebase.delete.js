import { db } from "./firebase-db.js";

// Helper function to delete a lottery by ID
export async function deleteLotteryFromFirebase(announceId) {
  try {
    const docRef = db.collection("whitelabel").doc(announceId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.log(`No document found with ID: ${announceId}`);
      return;
    }

    await docRef.delete();
    console.log(`Deleted Firebase Whitelabel document with ID: ${announceId}`);
  } catch (error) {
    console.error(`Error deleting Whitelabel document from Firebase: ${error}`);
  }
}