
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import * as dataService from '../services/dataService';
import { USER_ROLES, EyeIcon, EyeSlashIcon } from '../constants';

interface AuthComponentProps {
  onAuthSuccess: (user: User) => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>('');
  const [recruiters, setRecruiters] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recruitersLoading, setRecruitersLoading] = useState(false);

  useEffect(() => {
    if (!isLogin && role === UserRole.CANDIDATE) {
      setRecruitersLoading(true);
      setError(null); 
      dataService.getAllRecruiters()
        .then(fetchedRecruiters => {
          setRecruiters(fetchedRecruiters);
        })
        .catch(err => {
            setError(`Failed to load recruiters: ${err.message}`);
            setRecruiters([]);
        })
        .finally(() => {
            setRecruitersLoading(false);
        });
    } else {
      setRecruiters([]);
      setRecruitersLoading(false);
    }
  }, [isLogin, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistrationMessage(null);
    setLoading(true);
    try {
      if (isLogin) {
        const user = await dataService.loginUser(username, password);
        onAuthSuccess(user);
      } else {
        const registrationData: Omit<User, 'id' | 'password' | 'status'> & { password_unsafe: string } = {
          username,
          role,
          password_unsafe: password,
        };

        if (role === UserRole.CANDIDATE) {
          if (recruiters.length > 0 && !selectedRecruiterId) {
            throw new Error('Please select a recruiter.');
          }
          if (selectedRecruiterId) {
             registrationData.assignedRecruiterId = selectedRecruiterId;
          }
        }
        await dataService.registerUser(registrationData);
        // Do not call onAuthSuccess here. Instead, switch to login view and show message.
        setIsLogin(true);
        setRegistrationMessage("Registration successful! Please log in with your new credentials.");
        setUsername(''); // Clear username field
        setPassword(''); // Clear password field
        // Role and selectedRecruiterId will reset naturally or can be explicitly reset if needed
        setRole(UserRole.CANDIDATE); 
        setSelectedRecruiterId('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setRegistrationMessage(null);
    setUsername('');
    setPassword('');
    setRole(UserRole.CANDIDATE);
    setSelectedRecruiterId('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isLogin ? 'Login to continue your journey.' : 'Join our platform today.'}
        </p>
        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm border border-red-500/30">{error}</p>}
        {registrationMessage && <p className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4 text-sm border border-green-500/30">{registrationMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100 placeholder-slate-400"
              placeholder="yourusername"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100 placeholder-slate-400"
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
              </button>
            </div>
          </div>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as UserRole);
                    setSelectedRecruiterId(''); 
                    setError(null); 
                  }}
                  className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                >
                  {USER_ROLES.map(r => <option key={r.value} value={r.value} className="bg-slate-700 text-slate-100">{r.label}</option>)}
                </select>
              </div>
              {role === UserRole.CANDIDATE && (
                <div>
                  <label htmlFor="recruiter" className="block text-sm font-medium text-slate-300">Assign Recruiter</label>
                  {recruitersLoading ? (
                    <p className="mt-1 text-sm text-slate-400">Loading recruiters...</p>
                  ) : recruiters.length === 0 ? (
                    <p className="mt-1 text-sm text-yellow-400 bg-yellow-700/30 border border-yellow-600/50 p-3 rounded-md" role="alert">
                      We're sorry, waiting for recruiters.
                    </p>
                  ) : (
                    <select
                      id="recruiter"
                      value={selectedRecruiterId}
                      onChange={(e) => setSelectedRecruiterId(e.target.value)}
                      required={role === UserRole.CANDIDATE && recruiters.length > 0} 
                      className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    >
                      <option value="" className="bg-slate-700 text-slate-100">Select a Recruiter</option>
                      {recruiters.map(r => <option key={r.id} value={r.id} className="bg-slate-700 text-slate-100">{r.username}</option>)}
                    </select>
                  )}
                </div>
              )}
            </>
          )}
          <div>
            <button
              type="submit"
              disabled={loading || (role === UserRole.CANDIDATE && !isLogin && recruitersLoading)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleAuthMode} className="font-medium text-sky-400 hover:text-sky-300">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthComponent;
