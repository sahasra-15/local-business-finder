import { Link } from 'react-router-dom';
import { MapPin, Navigation, ShieldCheck, Heart, Sparkles, Database, Layers } from 'lucide-react';
import Button from '../components/common/Button';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About Local Business Finder</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Bridging Neighbors with Exceptional Local Services
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Local Business Finder is a location-aware web platform developed to help residents across
          Hyderabad explore, review, and navigate to local businesses, services, and hidden gems.
        </p>
      </div>

      {/* Technology & Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Geospatial Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utilizes browser Geolocation APIs and MongoDB 2dsphere spherical indexing to calculate exact
            proximity distances in kilometers from user coordinates.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Interactive Open Maps</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Integrated with Leaflet.js and OpenStreetMap raster tiles, offering interactive marker
            pinpoints, customized popup previews, and Google Maps directions links.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Trust & Authenticity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Featuring authenticated user reviews, dynamic star distribution recalculations, role-based
            access control (Customer, Owner, Admin), and duplicate review prevention.
          </p>
        </div>
      </div>

      {/* Multi-Zone & Nationwide Coverage */}
      <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Multi-Zone & Nationwide Coverage</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Coverage Across Hyderabad, Metros & Beyond</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          The platform covers all zones across Greater Hyderabad (Banjara Hills, Jubilee Hills, Hitec City,
          Gachibowli, Begumpet, Charminar, Secunderabad, ECIL, AS Rao Nagar, Sainikpuri) and major metropolitan
          hubs including Bengaluru, Mumbai, and Delhi NCR, plus freeform global address geocoding via OpenStreetMap.
        </p>
      </div>

      {/* Demonstration Notice */}
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
        <h4 className="font-bold uppercase tracking-wider">Demonstration Mode Notice</h4>
        <p>
          This application is built as a complete academic full-stack project showcase. All sample business
          records and contact numbers in the seed database represent plausible demonstration records for
          testing and evaluation purposes.
        </p>
      </div>
    </div>
  );
}
