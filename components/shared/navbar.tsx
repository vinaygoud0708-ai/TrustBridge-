"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Heart, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        const wasUnread = !notifications.find((n) => n.id === id)?.isRead;
        setNotifications(notifications.filter((n) => n.id !== id));
        if (wasUnread) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const getDashboardLink = () => {
    if (!session?.user) return "/";
    switch (session.user.role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "CHARITY":
        return "/dashboard/charity";
      case "DONOR":
      default:
        return "/dashboard/donor";
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "DONATION":
        return <Heart className="h-4 w-4 text-emerald-500" />;
      case "WITHDRAWAL":
        return <CheckCircle className="h-4 w-4 text-sky-500" />;
      case "PROOF":
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case "COMPLAINT":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const publicLinks = [
    { name: "Campaigns", href: "/campaigns" },
    { name: "Charities", href: "/charities" },
    { name: "About", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20 transform transition-transform group-hover:scale-105">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                Trust<span className="text-secondary">Bridge</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1">
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-slate-800/80 text-primary border-b-2 border-primary" 
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Area (Auth + Notifications) */}
          <div className="hidden md:flex items-center gap-4">
            {status === "authenticated" && session?.user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={() => {
                      setIsNotifDropdownOpen(!isNotifDropdownOpen);
                      setIsUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors relative"
                    aria-label="Toggle notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Drawer */}
                  {isNotifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up">
                      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
                        <span className="font-semibold text-sm text-white flex items-center gap-1.5">
                          <Bell className="h-4 w-4 text-primary" /> Notifications
                          {unreadCount > 0 && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-secondary hover:underline transition-all font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/65">
                        {notifications.length === 0 ? (
                          <div className="py-8 px-4 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                            <Clock className="h-8 w-8 text-slate-700" />
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id);
                                setIsNotifDropdownOpen(false);
                              }}
                              className={cn(
                                "p-3 flex gap-2.5 hover:bg-slate-800/40 cursor-pointer transition-colors text-left",
                                !notif.isRead && "bg-primary/5"
                              )}
                            >
                              <div className="mt-0.5 p-1.5 bg-slate-800/80 rounded-lg flex-shrink-0 h-8 w-8 flex items-center justify-center">
                                {getNotifIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white leading-tight truncate">
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[9px] text-slate-500 block mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                onClick={(e) => deleteNotif(notif.id, e)}
                                className="text-slate-600 hover:text-slate-400 self-center p-1 rounded-md transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 5 && (
                        <div className="p-2.5 text-center border-t border-slate-800 bg-slate-950/40">
                          <Link
                            href={getDashboardLink()}
                            onClick={() => setIsNotifDropdownOpen(false)}
                            className="text-xs text-primary hover:text-secondary font-semibold transition-colors"
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Options Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-sm font-medium text-white transition-all transform hover:-translate-y-0.5"
                  >
                    <div className="h-7 w-7 rounded-lg bg-primary/25 text-primary flex items-center justify-center font-bold text-xs">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="max-w-[100px] truncate">{session.user.name}</span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isUserDropdownOpen && "rotate-180")} />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden py-1 animate-fade-in-up">
                      <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/25">
                        <p className="text-xs font-semibold text-white truncate">{session.user.email}</p>
                        <span className="inline-block text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 border border-primary/20">
                          {session.user.role}
                        </span>
                      </div>
                      
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Shield className="h-4 w-4 text-primary" /> Dashboard
                      </Link>

                      {session.user.role === "DONOR" && (
                        <Link
                          href="/dashboard/donor/settings"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Settings className="h-4 w-4 text-slate-400" /> Account Settings
                        </Link>
                      )}

                      {session.user.role === "CHARITY" && (
                        <Link
                          href="/dashboard/charity/settings"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Settings className="h-4 w-4 text-slate-400" /> NGO Profile Settings
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors border-t border-slate-800 mt-1"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white rounded-xl shadow-md shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              aria-label="Toggle main menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-2 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in-up">
          {publicLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-slate-800/80 mt-2">
            {status === "authenticated" && session?.user ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-base font-medium text-primary hover:bg-slate-800 transition-colors"
                >
                  Dashboard ({session.user.role})
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left block px-4 py-2.5 rounded-lg text-base font-medium text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-700 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary font-semibold text-white shadow-md shadow-primary/10 transition-all hover:opacity-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
