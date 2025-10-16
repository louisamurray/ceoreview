"use client";

import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthForm from '../../components/AuthForm';

interface Review {
  id: string;
  employeeName?: string;
  role?: string;
  department?: string;
  reviewPeriod?: string;
  [key: string]: unknown;
}

function isAdmin(user: User | null) {
  // Admin check: demo@example.com or any @yourcompany.com email
  return user && user.email && (
    user.email === 'demo@example.com' || 
    user.email.endsWith('@yourcompany.com')
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) {
      async function fetchReviews() {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [user]);

  if (!user) {
    return <AuthForm />;
  }

  if (!isAdmin(user)) {
    return <div className="p-8 text-red-500">Access denied. Admins only.</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <ul>
        {reviews.length === 0 ? (
          <li>No reviews found.</li>
        ) : (
          reviews.map(review => (
            <li key={review.id} className="mb-2 p-2 border rounded">
              <strong>{review.employeeName || 'Unnamed Employee'}</strong> — {review.role || 'Role'}
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
