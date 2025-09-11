
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

// Helper: get review doc ref for current user
function getReviewDocRef(uid) {
  return db.collection('reviews').doc(uid);
}

// Login
function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Logout
function logout() {
  return auth.signOut();
}

// Save review data
function saveReviewData(uid, data) {
  return getReviewDocRef(uid).set({
    uid,
    timestamp: new Date().toISOString(),
    data
  });
}

// Load review data
function loadReviewData(uid) {
  return getReviewDocRef(uid).get().then(doc => doc.exists ? doc.data() : null);
}

// Auth state listener
auth.onAuthStateChanged(user => {
  window.onFirebaseAuthStateChanged && window.onFirebaseAuthStateChanged(user);
});

// Expose helpers globally
window.firebaseHelpers = {
  loginWithEmail,
  logout,
  saveReviewData,
  loadReviewData,
  auth
};