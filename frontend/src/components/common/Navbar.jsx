import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Menu,
  X,
  User,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Navigation,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const {
    localityName,
    requestCurrentLocation,
    isLocating,
    selectLocality,
    localities,
    geocodeAddress,
  } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-teal-600 font-semibold'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-600 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                Local<span className="text-teal-600">Biz</span>Finder
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-0.5">
                Hyderabad Localities
              </span>
            </div>
          </Link>

          {/* Location Selector (Desktop) */}
          <div className="hidden lg:block relative" ref={locationDropdownRef}>
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span className="max-w-[150px] truncate">{localityName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {locationDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-scale-up space-y-2">
                <button
                  onClick={() => {
                    requestCurrentLocation();
                    setLocationDropdownOpen(false);
                  }}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isLocating ? 'Detecting GPS...' : 'Use My Current GPS'}</span>
                </button>

                {/* Freeform Search any place */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = e.target.elements.geoSearch.value;
                    if (query) {
                      geocodeAddress(query);
                      setLocationDropdownOpen(false);
                    }
                  }}
                  className="flex gap-1"
                >
                  <input
                    name="geoSearch"
                    type="text"
                    placeholder="Search any area, city or pin..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-teal-600 transition shrink-0 cursor-pointer"
                  >
                    Go
                  </button>
                </form>

                <div className="max-h-60 overflow-y-auto px-1 py-1 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hyderabad & Major Metros
                  </div>
                  {localities.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        selectLocality(loc);
                        setLocationDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1 shrink-0">{loc.city || 'Hyderabad'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore Businesses
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              Map View
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          {/* User Auth Buttons / Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="text-left text-xs">
                    <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
                      {user.role === 'business_owner'
                        ? 'Owner'
                        : user.role === 'admin'
                        ? 'Admin'
                        : 'Member'}
                    </span>
                  </div>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-up">
                    <div className="px-4 py-2 border-b border-slate-100 text-xs">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Businesses</span>
                    </Link>

                    {isOwner && (
                      <Link
                        to="/owner"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50 transition"
                      >
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span>Owner Dashboard</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-slide-down">
          {/* Location for mobile */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Active Area:</span>
              <span className="font-bold text-slate-900">{localityName}</span>
            </div>
            <button
              onClick={() => {
                requestCurrentLocation();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Current Location</span>
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </NavLink>
            <NavLink
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Explore Businesses
            </NavLink>
            <NavLink
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Categories
            </NavLink>
            <NavLink
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Interactive Map
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Contact
            </NavLink>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Profile ({user.name})
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Saved Businesses
                </Link>
                {isOwner && (
                  <Link
                    to="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-teal-700 hover:bg-teal-50"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
