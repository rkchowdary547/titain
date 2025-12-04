
import React, { useState } from 'react';
import { UserRole } from '../types';

interface AuthProps {
  onLogin: (role: UserRole, credentials: { identifier: string; secret: string }) => Promise<void>;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier('');
    setSecret('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await onLogin(selectedRole, { identifier, secret });
    } catch (err) {
        setError('Invalid credentials. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-titan-950 items-center justify-center p-4">
      <div className="w-full max-w-md bg-titan-900 border border-titan-800 rounded-2xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-titan-900 font-bold text-2xl">
                T
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">TitanFit Secure Login</h1>
            <p className="text-titan-400 text-sm">Please identify yourself</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-titan-950 rounded-xl mb-8">
            <button 
                onClick={() => handleRoleSwitch(UserRole.CLIENT)}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedRole === UserRole.CLIENT 
                    ? 'bg-titan-800 text-white shadow-sm' 
                    : 'text-titan-500 hover:text-titan-300'
                }`}
            >
                Client
            </button>
            <button 
                onClick={() => handleRoleSwitch(UserRole.COACH)}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedRole === UserRole.COACH
                    ? 'bg-titan-800 text-white shadow-sm' 
                    : 'text-titan-500 hover:text-titan-300'
                }`}
            >
                Coach
            </button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-lg text-center font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-titan-400 mb-1 uppercase">
                    {selectedRole === UserRole.COACH ? 'Username' : 'Username'}
                </label>
                <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={selectedRole === UserRole.COACH ? 'e.g. rushi' : 'e.g. janedoe_fit'}
                    required
                    className="w-full px-4 py-3 bg-titan-950 border border-titan-700 rounded-lg text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                />
            </div>
            
            <div>
                 <label className="block text-xs font-medium text-titan-400 mb-1 uppercase">
                    {selectedRole === UserRole.COACH ? 'Password' : 'Passport Code'}
                </label>
                <input 
                    type="password" 
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder={selectedRole === UserRole.COACH ? 'Enter password' : 'Enter provided code'}
                    required
                    className="w-full px-4 py-3 bg-titan-950 border border-titan-700 rounded-lg text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                />
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    'Secure Sign In'
                )}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-titan-500">
            {selectedRole === UserRole.CLIENT && (
              <p className="mb-2">Tip: Ask your coach for your Passport Code</p>
            )}
            <p>Protected by TitanFit Security</p>
        </div>

      </div>
    </div>
  );
};

export default Auth;
