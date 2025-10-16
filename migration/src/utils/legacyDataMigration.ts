// Utility to migrate legacy review data to Firestore
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export interface LegacyReview {
  name?: string;
  employeeName?: string;
  role?: string;
  department?: string;
  period?: string;
  reviewPeriod?: string;
  [key: string]: unknown;
}

export async function migrateLegacyReviews(legacyReviews: LegacyReview[]) {
  const reviewsCollection = collection(db, 'reviews');
  for (const review of legacyReviews) {
    // Map legacy fields to new schema as needed
    const newReview = {
      employeeName: review.name || review.employeeName,
      role: review.role,
      department: review.department,
      reviewPeriod: review.period || review.reviewPeriod,
      // Add other fields and transform as needed
      ...review
    };
    await addDoc(reviewsCollection, newReview);
  }
}
