'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPasswords,
  fetchPasswordById,
  createPassword,
  updatePassword,
  deletePassword,
  searchPasswords,
  Password,
  CreatePasswordData,
  UpdatePasswordData,
} from '@/store/slices/passwordsSlice';
import { PasswordCard } from '@/components/vault/PasswordCard';
import { PasswordForm } from '@/components/vault/PasswordForm';
import { Lock, Plus, Search, Loader2, Shield } from 'lucide-react';

/**
 * Password Vault Page
 * Secure password manager with AES encryption
 */
export default function VaultPage() {
  const dispatch = useAppDispatch();
  const { passwords, isLoading, error } = useAppSelector((state) => state.passwords);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch passwords on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPasswords());
    }
  }, [dispatch, isAuthenticated]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch(fetchPasswords());
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      dispatch(searchPasswords(searchQuery)).finally(() => {
        setIsSearching(false);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Handle view password (decrypt)
  const handleViewPassword = async (id: string) => {
    if (decryptedPasswords[id]) return;

    const result = await dispatch(fetchPasswordById(id));

    if (fetchPasswordById.fulfilled.match(result)) {
      const pwd = result.payload;
      setDecryptedPasswords((prev) => ({
        ...prev,
        [id]: pwd.password || '',
      }));
    }
  };

  // Handle create password
  const handleCreatePassword = async (data: CreatePasswordData) => {
    const result = await dispatch(createPassword(data));

    if (createPassword.fulfilled.match(result)) {
      setShowForm(false);
    }
  };

  // Handle edit password
  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setShowForm(true);
  };

  // Handle update password
  const handleUpdatePassword = async (data: Omit<UpdatePasswordData, 'id'>) => {
    if (!editingPassword) return;

    const result = await dispatch(
      updatePassword({
        id: editingPassword.id,
        ...data,
      })
    );

    if (updatePassword.fulfilled.match(result)) {
      setShowForm(false);
      setEditingPassword(null);
      // Clear decrypted password if it was updated
      setDecryptedPasswords((prev) => {
        const newState = { ...prev };
        delete newState[editingPassword.id];
        return newState;
      });
    }
  };

  // Handle delete password
  const handleDeletePassword = async (id: string) => {
    if (confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
      await dispatch(deletePassword(id));
      // Clear decrypted password
      setDecryptedPasswords((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPassword(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-2">
                <Shield className="text-purple-600 dark:text-purple-400" size={32} />
                Password Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Securely store and manage your passwords with AES encryption
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Password
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search passwords by service name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-600 dark:text-purple-400"
                size={20}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {isLoading && passwords.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-purple-600 dark:text-purple-400" size={48} />
            </div>
          ) : passwords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Lock size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No passwords found' : 'No passwords yet'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start by adding your first password to the vault'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {passwords.map((password) => (
                <PasswordCard
                  key={password.id}
                  password={password}
                  decryptedPassword={decryptedPasswords[password.id]}
                  onView={() => handleViewPassword(password.id)}
                  onEdit={() => handleEditPassword(password)}
                  onDelete={() => handleDeletePassword(password.id)}
                />
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Password Form Modal */}
      {showForm && (
        <PasswordForm
          title={editingPassword ? 'Edit Password' : 'Add Password'}
          initialData={
            editingPassword
              ? {
                  service_name: editingPassword.service_name,
                  username: editingPassword.username,
                  password: decryptedPasswords[editingPassword.id] || '',
                  url: editingPassword.url || '',
                  notes: editingPassword.notes || '',
                }
              : undefined
          }
          onSubmit={editingPassword ? handleUpdatePassword : handleCreatePassword}
          onCancel={handleCloseForm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
