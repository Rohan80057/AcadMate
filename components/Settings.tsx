
import React, { useState, useEffect, ChangeEvent } from 'react';
import { UserProfile } from '../types';
import { UserIcon } from './Icons';

interface SettingsProps {
    userProfile: UserProfile | null;
    onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onProfileUpdate }) => {
    const [profile, setProfile] = useState<UserProfile | null>(userProfile);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!profile) return;
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && profile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfile({ ...profile, profilePic: event.target?.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(profile) {
            onProfileUpdate(profile);
        }
    }

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!userProfile) return;
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        const users = JSON.parse(localStorage.getItem('acadmate-users') || '{}');
        if (users[userProfile.email] === currentPassword) {
            users[userProfile.email] = newPassword;
            localStorage.setItem('acadmate-users', JSON.stringify(users));
            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordError("Current password is incorrect.");
        }
    };
    
    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Details Section */}
            <form onSubmit={handleProfileSave} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Profile Details</h2>
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-24 h-24">
                        <div className="w-24 h-24 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center overflow-hidden">
                             {profile.profilePic ? <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover"/> : <UserIcon className="w-12 h-12 text-gray-400"/>}
                        </div>
                        <label htmlFor="profilePicInput" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-primary-light transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                        </label>
                        <input id="profilePicInput" type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="name" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Full Name</label>
                        <input type="text" id="name" name="name" value={profile.name} onChange={handleInputChange} className="mt-1 block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Email Address</label>
                        <input type="email" id="email" name="email" value={profile.email} className="mt-1 block w-full p-3 bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 rounded-lg cursor-not-allowed" readOnly />
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Date of Birth</label>
                        <input type="date" id="dob" name="dob" value={profile.dob || ''} onChange={handleInputChange} className="mt-1 block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="college" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">College/University Name</label>
                        <input type="text" id="college" name="college" value={profile.college || ''} onChange={handleInputChange} placeholder="e.g., University of Knowledge" className="mt-1 block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
                 <div className="mt-6 text-right">
                    <button type="submit" className="px-6 py-2 text-white font-semibold bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm">Save Profile</button>
                </div>
            </form>

            {/* Change Password Section */}
            <form onSubmit={handlePasswordChange} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-2xl shadow-sm">
                 <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Change Password</h2>
                 <div className="space-y-4">
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="block w-full p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                 </div>
                 {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                 {passwordSuccess && <p className="text-green-500 text-sm mt-2">{passwordSuccess}</p>}
                 <div className="mt-6 text-right">
                    <button type="submit" className="px-6 py-2 text-white font-semibold bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm">Update Password</button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
