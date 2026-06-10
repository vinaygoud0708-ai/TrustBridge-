import Link from "next/link";
import { Shield, Mail, Phone, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Trust<span className="text-secondary">Bridge</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A transparent charity platform building unbreakable connections between donors and verified NGOs through real-time escrow tracking and automated trust algorithms.
          </p>
        </div>

        {/* Quick Links column */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Explore</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/campaigns" className="hover:text-primary transition-colors">Browse Campaigns</Link>
            </li>
            <li>
              <Link href="/charities" className="hover:text-primary transition-colors">Verified NGOs</Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-primary transition-colors">How Verification Works</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            </li>
          </ul>
        </div>

        {/* Categories column */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/campaigns?category=EDUCATION" className="hover:text-primary transition-colors">Education Support</Link>
            </li>
            <li>
              <Link href="/campaigns?category=HEALTH" className="hover:text-primary transition-colors">Medical & Healthcare</Link>
            </li>
            <li>
              <Link href="/campaigns?category=DISASTER" className="hover:text-primary transition-colors">Disaster & Relief</Link>
            </li>
            <li>
              <Link href="/campaigns?category=ENVIRONMENT" className="hover:text-primary transition-colors">Environment & Water</Link>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Contact Info</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-primary" />
              <span>support@trustbridge.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4.5 w-4.5 text-primary" />
              <span>+91 86868 67862</span>
            </li>
            <li className="text-[10px] text-slate-500 italic mt-3">
              Project Concept by Masood Mirza
            </li>
          </ul>
        </div>

      </div>

      {/* Attribution & Copyright bar */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} TrustBridge. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for transparent giving.
          Concept by <span className="text-slate-400 font-semibold">Masood Mirza</span>.
        </p>
      </div>
    </footer>
  );
}
