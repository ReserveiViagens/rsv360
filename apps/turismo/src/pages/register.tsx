import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('/api/core/users/', { email, password, fullName });
            router.push('/login'); // Redirect to login page after successful registration
        } catch (err) {
            setError('Failed to register. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-sm">
            <h1 className="text-3xl font-bold mb-4">Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="fullName" className="block text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        autoComplete="name"
                        aria-describedby="fullName-error"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        autoComplete="email"
                        aria-describedby="email-error"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        autoComplete="new-password"
                        aria-describedby="password-error"
                    />
                </div>
                {error && (
                    <div id="register-error" className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby="register-error"
                >
                    Register
                </button>
            </form>
        </div>
    );
} 