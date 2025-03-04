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
    Cog6ToothIcon as CogIcon,
    ArrowLeftOnRectangleIcon as LogoutIcon,
    Squares2X2Icon as ViewGridIcon,
    RectangleStackIcon as CollectionIcon,
  } from "@heroicons/react/24/outline";
  

interface AdminLayoutProps {
  children: ReactNode;
}

// Tipe untuk item navigasi
interface NavItem {
  name: string;
  href: string;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  current: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminUsername = localStorage.getItem("adminUsername");

    if (!token) {
      router.push("/");
      return;
    }

    if (adminUsername) {
      setUsername(adminUsername);
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    router.push("/");
  };

  // Navigation items with dynamic 'current' property
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
      name: "Menu",
      href: "/admins/menu",
      icon: ViewGridIcon,
      current: router.pathname.startsWith("/admins/menu"),
    },
    {
      name: "Sub Menu",
      href: "/admins/sub-menu",
      icon: CollectionIcon,
      current: router.pathname.startsWith("/admins/sub-menu"),
    },
    {
      name: "Pengaturan",
      href: "/admins/settings",
      icon: CogIcon,
      current: router.pathname === "/admins/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin dashboard" />
      </Head>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4">
            <Image
              className="h-8 w-auto"
              src="https://bankabdi.co.id/img/logo/logo-color-abdi.svg"
              alt="Bank ABDI"
              width={157}
              height={32}
            />
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    item.current
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      item.current
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogoutIcon
                  className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Image
              className="h-8 w-auto"
              src="https://bankabdi.co.id/img/logo/logo-color-abdi.svg"
              alt="Bank ABDI"
              width={157}
              height={32}
            />
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      item.current
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogoutIcon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Dapat ditambahkan search bar di sini jika diperlukan */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* User info */}
              <div className="flex items-center">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {username || "Admin"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    Administrator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}