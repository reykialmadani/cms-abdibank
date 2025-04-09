// components/layouts/AdminLayout.tsx
import { ReactNode, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
// Icons
import {
  HomeIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon,
  UserGroupIcon,
  ChevronDownIcon,
  UserCircleIcon,
  KeyIcon, 
} from "@heroicons/react/24/outline";

import ChangePasswordModal from "../component/ChagePasswordModal"; 

interface AdminLayoutProps {
  children: ReactNode;
}

// Tipe untuk item navigasi
interface NavItem {
  name: string;
  href: string;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  current: boolean;
  requiredRole?: string[]; 
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); 
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false); 
  
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminUsername = localStorage.getItem("adminUsername");
    const role = localStorage.getItem("adminRole");

    if (!token) {
      router.push("/");
      return;
    }
    
    if (adminUsername) {
      setUsername(adminUsername);
    }
    
    if (role) {
      setUserRole(role);
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminRole");
    router.push("/");
  };

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admins/dashboard",
      icon: HomeIcon,
      current: router.pathname === "/admins/dashboard",
    },
    {
      name: "Content",
      href: "/admins/content",
      icon: DocumentTextIcon,
      current: router.pathname.startsWith("/admins/content"),
    },
    {
      name: "Operator",
      href: "/admins/operator",
      icon: UserGroupIcon,
      current: router.pathname.startsWith("/admins/operator"),
      requiredRole: ["admin"],
    },
  ];

  // Filter navigasi berdasarkan role
  const filteredNavigation = navigation.filter(
    (item) => !item.requiredRole || item.requiredRole.includes(userRole)
  );

  // Fungsi untuk membuka modal ganti password
  const openChangePasswordModal = () => {
    setChangePasswordModalOpen(true);
    setProfileMenuOpen(false); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin dashboard" />
      </Head>

      {/* Modal Ganti Password */}
      {changePasswordModalOpen && (
        <ChangePasswordModal
          isOpen={changePasswordModalOpen}
          onClose={() => setChangePasswordModalOpen(false)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <div className="flex items-center">
            <Image
              className="h-8 w-auto"
              src="https://bankabdi.co.id/img/logo/logo-color-abdi.svg"
              alt="Bank ABDI"
              width={140}
              height={28}
            />
          </div>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="p-2 rounded-full bg-blue-100">
                <UserCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-800">{username || "User"}</p>
                <p className="text-xs text-gray-500">
                  {userRole === "admin" ? "Administrator" : "Operator"}
                </p>
              </div>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-1 rounded-full hover:bg-blue-100"
              >
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                  profileMenuOpen ? "transform rotate-180" : ""
                } text-blue-500`}/>
              </button>
            </div>
            
            {/* Menu Profil Mobile */}
            <div className={`overflow-hidden transition-all duration-300 ${
              profileMenuOpen ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}>
              <div className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={openChangePasswordModal}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <KeyIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>

          <div className="px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <div key={item.name}>
                {item.name === "Content" ? (
                  <>
                    <button
                      onClick={() => setContentMenuOpen(!contentMenuOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        item.current
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={`flex-shrink-0 h-5 w-5 mr-3 ${
                            item.current ? "text-blue-500" : "text-gray-500"
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          contentMenuOpen ? "transform rotate-180" : ""
                        } ${item.current ? "text-blue-500" : "text-gray-500"}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        contentMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-12 py-2 space-y-2">
                        <Link
                          href="/admins/content/create"
                          className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
                        >
                          Create
                        </Link>
                        <Link
                          href="/admins/content/read"
                          className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      item.current
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`flex-shrink-0 h-5 w-5 mr-3 ${
                        item.current ? "text-blue-500" : "text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="px-2 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
            >
              <LogoutIcon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-sm z-20">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-100">
          <Image
            className="h-8 w-auto"
            src="https://bankabdi.co.id/img/logo/logo-color-abdi.svg"
            alt="Bank ABDI"
            width={140}
            height={28}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 mt-6 mb-6">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="p-2 rounded-full bg-blue-100">
                <UserCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-800">{username || "User"}</p>
                <p className="text-xs text-gray-500">
                  {userRole === "admin" ? "Administrator" : "Operator"}
                </p>
              </div>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-1 rounded-full hover:bg-blue-100"
              >
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                  profileMenuOpen ? "transform rotate-180" : ""
                } text-blue-500`}/>
              </button>
            </div>
            
            {/* Menu Profil Desktop */}
            <div className={`overflow-hidden transition-all duration-300 ${
              profileMenuOpen ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}>
              <div className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={openChangePasswordModal}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <KeyIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
          <nav className="px-3 pt-2 pb-5 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <div key={item.name}>
                  {item.name === "Content" ? (
                    <>
                      <button
                        onClick={() => setContentMenuOpen(!contentMenuOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          item.current
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`flex-shrink-0 h-5 w-5 mr-3 ${
                              item.current ? "text-blue-500" : "text-gray-500"
                            }`}
                            aria-hidden="true"
                          />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${
                            contentMenuOpen ? "transform rotate-180" : ""
                          } ${item.current ? "text-blue-500" : "text-gray-500"}`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          contentMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-11 py-2 space-y-1">
                          <Link
                            href="/admins/content/create"
                            className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
                          >
                            Create
                          </Link>
                          <Link
                            href="/admins/content/read"
                            className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
                          >
                            Read
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        item.current
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon
                        className={`flex-shrink-0 h-5 w-5 mr-3 ${
                          item.current ? "text-blue-500" : "text-gray-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-5 mt-5 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
              >
                <LogoutIcon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm h-16 flex items-center">
          <div className="flex items-center justify-between px-4 w-full">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0">
                {/* Display current page name based on route */}
                {filteredNavigation.find((item) => item.current)?.name || "Dashboard"}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="relative">
                    <button
                      className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    >
                      <span className="text-blue-600 font-medium">
                        {username ? username.charAt(0).toUpperCase() : "A"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}