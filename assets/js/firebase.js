// User roles management
function setUserRole(uid, role) {
  // Set or update the user's role in the 'users' collection
  return db.collection('users').doc(uid).set({
    role,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

function getUserRole(uid) {
  // Get the user's role from the 'users' collection
  return db.collection('users').doc(uid).get().then(doc => doc.exists ? doc.data().role : null);
}


// Your web app's Firebase configuration
/* 
const firebaseConfig = {
  apiKey: "AIzaSyA64oOlYODhYwXawZ8BDjU9uoZK7pn_aKQ",
  authDomain: "studio-8276146072-e2bec.firebaseapp.com",
  projectId: "studio-8276146072-e2bec",
  storageBucket: "studio-8276146072-e2bec.firebasestorage.app",
  messagingSenderId: "462550604907",
  appId: "1:462550604907:web:e19504133d5cb4bc12252e"
};
*/

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

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

function sendPasswordReset(email) {
  return auth.sendPasswordResetEmail(email);
}

// Save review data to a collection ("drafts" or "submissions")
function saveReviewData(uid, data, collection, overrides = {}) {
  const user = auth.currentUser;
  const payload = {
    uid,
    timestamp: new Date().toISOString(),
    userEmail: user?.email || null,
    userDisplayName: user?.displayName || null,
    data,
    ...overrides
  };
  return getReviewDocRef(uid, collection).set(payload, { merge: true });
}

// Load review data from a collection
function loadReviewData(uid, collection) {
  return getReviewDocRef(uid, collection).get().then(doc => doc.exists ? doc.data() : null);
}

function uploadReviewCsv(uid, filename, csvString) {
  const ref = storage.ref().child(`reviews/${uid}/${filename}`);
  const blob = new Blob([csvString], { type: 'text/csv' });
  return ref.put(blob);
}

function updateReviewMetadata(uid, collection, updates = {}) {
  const user = auth.currentUser;
  const payload = {
    uid,
    userEmail: user?.email || null,
    userDisplayName: user?.displayName || null,
    lastUpdatedAt: new Date().toISOString(),
    ...updates
  };
  return getReviewDocRef(uid, collection).set(payload, { merge: true });
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
  sendPasswordReset,
  saveReviewData,
  loadReviewData,
  uploadReviewCsv,
  updateReviewMetadata,
  setUserRole,
  getUserRole,
  auth
};
