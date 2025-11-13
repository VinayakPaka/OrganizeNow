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
import { ConfirmModal } from '@/components/ui/Modal';
import { Lock, Plus, Search, Loader2, Bell, Settings } from 'lucide-react';

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
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; passwordId: string | null }>({ show: false, passwordId: null });
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
    setConfirmDelete({ show: true, passwordId: id });
  };

  const confirmDeletePassword = async () => {
    if (!confirmDelete.passwordId) return;

    await dispatch(deletePassword(confirmDelete.passwordId));
    // Clear decrypted password
    setDecryptedPasswords((prev) => {
      const newState = { ...prev };
      delete newState[confirmDelete.passwordId!];
      return newState;
    });
    setConfirmDelete({ show: false, passwordId: null });
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPassword(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Password Vault</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{passwords.length} passwords stored</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search passwords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-600" size={18} />
                )}
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Passwords</h2>
            <p className="text-gray-600 dark:text-gray-400">Securely encrypted with AES-256</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 font-medium shadow-lg transition-all"
          >
            <Plus size={20} />
            Add Password
          </button>
        </div>

        {/* Loading State */}
        {isLoading && passwords.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600 dark:text-purple-400" size={48} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && passwords.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No passwords yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Start securing your passwords in the vault</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 font-medium shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Your First Password
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && passwords.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No passwords found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
          </div>
        )}

        {/* Passwords Grid */}
        {!isLoading && passwords.length > 0 && (
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
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-6 py-4 rounded-3xl shadow-lg">
            {error}
          </div>
        )}
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
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, passwordId: null })}
        onConfirm={confirmDeletePassword}
        title="Delete Password"
        message="Are you sure you want to delete this password? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
