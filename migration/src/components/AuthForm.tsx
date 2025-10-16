"use client";

import { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';

export default function AuthForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded">
      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border p-2 rounded" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border p-2 rounded" />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Login</button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}
    </div>
  );
}
