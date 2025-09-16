
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA64oOlYODhYwXawZ8BDjU9uoZK7pn_aKQ",
  authDomain: "studio-8276146072-e2bec.firebaseapp.com",
  projectId: "studio-8276146072-e2bec",
  storageBucket: "studio-8276146072-e2bec.firebasestorage.app",
  messagingSenderId: "462550604907",
  appId: "1:462550604907:web:e19504133d5cb4bc12252e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Helper: get review doc ref for current user and collection
function getReviewDocRef(uid, collection) {
  return db.collection(collection).doc(uid);
}

// Login

function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Sign Up
function signUpWithEmail(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

// Logout
function logout() {
  return auth.signOut();
}

// Save review data to a collection ("drafts" or "submissions")
function saveReviewData(uid, data, collection) {
  return getReviewDocRef(uid, collection).set({
    uid,
    timestamp: new Date().toISOString(),
    data
  });
}

// Load review data from a collection
function loadReviewData(uid, collection) {
  return getReviewDocRef(uid, collection).get().then(doc => doc.exists ? doc.data() : null);
}

// Auth state listener
auth.onAuthStateChanged(user => {
  window.onFirebaseAuthStateChanged && window.onFirebaseAuthStateChanged(user);
});

// Expose helpers globally
window.firebaseHelpers = {
  loginWithEmail,
  signUpWithEmail,
  logout,
  saveReviewData,
  loadReviewData,
  auth
};