"use client";

import { useEffect, useState } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import AuthForm from '../components/AuthForm';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Review {
  id: string;
  employeeName?: string;
  role?: string;
  department?: string;
  reviewPeriod?: string;
  [key: string]: unknown;
}

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Employee Reviews</h1>
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
