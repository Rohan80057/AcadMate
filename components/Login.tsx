
import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import { UserProfile } from '../types';

interface LoginProps {
    onLoginSuccess: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };
    
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        const users = JSON.parse(localStorage.getItem('acadmate-users') || '{}');

        if (isLoginView) {
            // Handle Login
            if (users[email] && users[email] === password) {
                localStorage.setItem('acadmate-user', email);
                onLoginSuccess(email);
            } else {
                setError("Invalid email or password.");
            }
        } else {
            // Handle Sign Up
            if (password.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (users[email]) {
                setError("An account with this email already exists.");
                return;
            }
            
            users[email] = password;
            localStorage.setItem('acadmate-users', JSON.stringify(users));
            
            // Create a default profile for the new user
            const profiles = JSON.parse(localStorage.getItem('acadmate-profiles') || '{}');
            const newProfile: UserProfile = {
                name: email.split('@')[0],
                email: email,
            };
            profiles[email] = newProfile;
            localStorage.setItem('acadmate-profiles', JSON.stringify(profiles));

            localStorage.setItem('acadmate-user', email);
            onLoginSuccess(email);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/30">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fadeIn">
                     <h1 className="text-5xl font-extrabold tracking-tighter mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                        AcadMate
                        </span>
                    </h1>
                    <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">Your Academic Sidekick</p>
                </div>

                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-2xl rounded-2xl p-8 transition-all duration-500">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text mb-6">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                        />
                        {!isLoginView && (
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                required
                            />
                        )}

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 text-white font-semibold bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
                        >
                            {isLoginView ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleView} className="font-semibold text-primary hover:underline ml-1">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
