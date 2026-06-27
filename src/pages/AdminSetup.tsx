import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../lib/auth';
import { fetchSpreadsheetData } from '../lib/sheets';
import { Database, LogOut, RefreshCcw, Server } from 'lucide-react';

export default function AdminSetup() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [syncCount, setSyncCount] = useState<number | null>(null);

  useEffect(() => {
    initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    
    // Check initial status
    fetch('/api/admin/status')
      .then(res => res.json())
      .then(data => {
        if (data.synced) {
          setSyncCount(data.count);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !spreadsheetId) return;

    setIsSyncing(true);
    setMessage('');

    try {
      // 1. Fetch from Google Sheets
      const students = await fetchSpreadsheetData(spreadsheetId, token);
      
      if (students.length === 0) {
        setMessage('No valid student data found in the spreadsheet.');
        setIsSyncing(false);
        return;
      }

      // 2. Sync to Server
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: Synced ${data.count} students.`);
        setSyncCount(data.count);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Server className="w-10 h-10 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel SPMB</h1>
        </div>

        {needsAuth ? (
          <div className="flex flex-col items-center">
            <p className="text-center text-gray-600 mb-6">
              Sign in with your Google account to authorize access to the Google Spreadsheet.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors disabled:opacity-70"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-6">
              <div className="text-sm">
                <span className="text-gray-500">Signed in as:</span><br />
                <span className="font-semibold text-blue-800">{user?.email}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSync} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Spreadsheet ID
                </label>
                <input
                  type="text"
                  required
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="e.g. 1BxiMVs0XRYFgwnAKB..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copy the ID from your Google Sheets URL.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSyncing || !spreadsheetId}
                className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors disabled:opacity-70"
              >
                {isSyncing ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Sync Data to Server
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Database Status:</span>
                <span className="font-bold">{syncCount !== null ? `${syncCount} students synced` : 'No data'}</span>
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <a href="/" className="text-blue-600 text-sm hover:underline">Go to Student Portal &rarr;</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
