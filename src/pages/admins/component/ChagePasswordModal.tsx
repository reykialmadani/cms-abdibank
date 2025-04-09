// components/modals/ChangePasswordModal.tsx
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, LockClosedIcon, KeyIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi form
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua kolom harus diisi");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword.length > 10) {
      setError("Password baru maksimal 10 karakter");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const adminId = localStorage.getItem("adminId");

      if (!token || !adminId) {
        setError("Sesi login tidak valid. Silakan login ulang.");
        setIsLoading(false);
        return;
      }

      // Pertama verifikasi password saat ini menggunakan endpoint verifikasi
      const verifyResult = await axios.post(
        "/api/admin/verify-password",
        { adminId, password: currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!verifyResult.data.valid) {
        setError("Password saat ini tidak valid");
        setIsLoading(false);
        return;
      }

      // Jika password terverifikasi, lanjutkan dengan update password
      const response = await axios.put(
        `/api/admin/${adminId}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setSuccess("Password berhasil diubah");
        // Reset form setelah berhasil
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Tutup modal setelah 2 detik
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response) {
        // Error dari server
        setError(
          error.response.data.error ||
            error.response.data.message ||
            "Terjadi kesalahan saat mengubah password"
        );
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        setError("Tidak ada respons dari server. Periksa koneksi internet Anda.");
      } else {
        // Error lainnya
        setError("Terjadi kesalahan pada sistem");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <LockClosedIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      Ganti Password
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 transition-colors duration-200 bg-gray-100 p-1.5 rounded-full"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-start space-x-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg flex items-start space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-2">
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="current-password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="text-black w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                          placeholder="Masukkan password saat ini"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="text-black w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                          placeholder="Masukkan password baru"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Password harus memiliki 8-10 karakter
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="confirm-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="text-black w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                          placeholder="Konfirmasi password baru"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </span>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}