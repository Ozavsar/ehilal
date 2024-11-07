"use client";
import Link from "next/link";
import { useState } from "react";
import { Home, Edit, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardContainer() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Toggle sidebar on mobile

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home /> },
    { name: "Write Article", href: "/dashboard/write", icon: <Edit /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings /> },
    { name: "Logout", href: "/logout", icon: <LogOut /> },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-muted transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-primary p-4">
          <h2 className="text-center text-2xl font-bold">
            Admin Dashboard
          </h2>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              passHref
              className={`flex items-center p-4 hover:bg-background hover:text-primary ${
                active === item.name.toLowerCase() &&
                "bg-background text-white hover:bg-primary hover:text-white"
              }`}
              onClick={() => {
                setActive(item.name.toLowerCase());
                setSidebarOpen(false); // Close sidebar on item click (for mobile)
              }}
            >
              {item.icon}
              <span className="ml-4">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex w-full items-center justify-between border-b border-primary bg-muted px-6 py-4 max-sm:shadow-sm">
          {/* Menu button for mobile */}
          <button
            className="text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">Welcome, Admin</h1>
          <div className="text-sm text-gray-400">
            Today: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 text-xl font-semibold">Dashboard</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card Example */}
            <div className="rounded-lg bg-muted p-4 shadow-md">
              <h2 className="text-lg font-semibold">Write New Article</h2>
              <p className="mt-2 text-gray-300">
                Start composing new articles for the blog.
              </p>
              <Link href="/dashboard/write" passHref>
                <Button className="mt-4 w-full">Go to Write Article</Button>
              </Link>
            </div>

            <div className="rounded-lg bg-muted p-4 shadow-md">
              <h2 className="text-lg font-semibold">Manage Settings</h2>
              <p className="mt-2 text-gray-300">
                Customize dashboard and website settings.
              </p>
              <Link href="/dashboard/settings" passHref>
                <Button className="mt-4 w-full">Go to Settings</Button>
              </Link>
            </div>

            <div className="rounded-lg bg-muted p-4 shadow-md">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="mt-2 text-gray-300">
                View and update your profile information.
              </p>
              <Link href="/dashboard/profile" passHref>
                <Button className="mt-4 w-full">Go to Profile</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
