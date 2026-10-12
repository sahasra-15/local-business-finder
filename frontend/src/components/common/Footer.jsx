import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Heart, Shield } from 'lucide-react';
import { HYDERABAD_LOCALITIES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Local<span className="text-teal-400">Biz</span>Finder
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Discover, rate, and connect with verified local services, culinary gems, healthcare, and retail spots across Hyderabad localities including ECIL, AS Rao Nagar, Sainikpuri, Nagaram, and Tarnaka.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Geospatial Proximity Search</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>OpenStreetMap Tiles</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  All Businesses
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition">
                  Categories Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Platform
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Hyderabad Localities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Popular Localities
            </h4>
            <ul className="space-y-2.5 text-xs">
              {HYDERABAD_LOCALITIES.slice(0, 5).map((loc) => (
                <li key={loc.name}>
                  <Link
                    to={`/explore?locality=${encodeURIComponent(loc.name)}`}
                    className="hover:text-white transition"
                  >
                    {loc.name}, Hyderabad
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business Owners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Business Owners
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-white transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Owner Sign In
                </Link>
              </li>
              <li>
                <span className="inline-block px-2 py-0.5 mt-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-[11px] font-semibold">
                  100% Free Listing
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner with Demo Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Local Business Finder. Demonstration Academic Full-Stack Project.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span>Notice: Sample listings represent demonstration records in Hyderabad, Telangana.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
