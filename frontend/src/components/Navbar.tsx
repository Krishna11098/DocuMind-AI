'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { logout, getCurrentUser, User } from '@/lib/api';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
    if (userData.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/employee');
    }
  };

  const handleSignupSuccess = (userData: User) => {
    setUser(userData);
    setShowSignup(false);
    if (userData.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/employee');
    }
  };

  return (
    <>
      <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition">
                DocuMind AI
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-200 transition">
                Features
              </a>
              <a href="#about" className="hover:text-blue-200 transition">
                About
              </a>
              
              {/* Admin Only Links */}
              {user && user.isAdmin && (
                <>
                  <a href="/admin" className="hover:text-blue-200 transition font-medium">
                    Admin Dashboard
                  </a>
                  <a href="/documents" className="hover:text-blue-200 transition font-medium">
                    Documents
                  </a>
                  <a href="/text-analyzer" className="hover:text-blue-200 transition font-medium">
                    Text Analyzer
                  </a>
                </>
              )}

              {/* Employee Links */}
              {user && !user.isAdmin && (
                <Link href="/employee" className="hover:text-blue-200 transition font-medium">
                  My Dashboard
                </Link>
              )}
              
              <a href="#contact" className="hover:text-blue-200 transition">
                Contact
              </a>
            </div>

            {/* Auth Buttons or User Menu */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-8 bg-blue-700 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Welcome, <span className="font-semibold">{user.name}</span>
                  </span>
                  {user.isAdmin && (
                    <span className="px-2 py-1 bg-yellow-500 text-xs rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}
