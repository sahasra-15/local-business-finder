import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, Building2, MapPin, Star, AlertCircle } from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBusinesses = async () => {
    setLoading(true);
    try {
      const res = await businessService.getMyBusinesses();
      setBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error('Failed to load owned businesses:', err);
      toast.error('Unable to fetch your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await businessService.deleteBusiness(id);
      toast.success(`"${name}" was deleted successfully.`);
      setBusinesses((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Merchant Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Business Owner Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your listings, opening hours, contact details, and view customer reviews.
          </p>
        </div>

        <Link to="/owner/add">
          <Button variant="teal" size="md" icon={Plus}>
            Register New Business
          </Button>
        </Link>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading your listings...</div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Business Listings Yet"
          description="Register your first business listing in Hyderabad to start attracting local customers."
          actionLabel="List a Business Now"
          onAction={() => (window.location.href = '/owner/add')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Business</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Locality</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((biz) => (
                  <tr key={biz._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            biz.images?.[0] ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'
                          }
                          alt={biz.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <Link
                            to={`/business/${biz._id}`}
                            className="font-bold text-slate-900 hover:text-teal-600 text-sm block"
                          >
                            {biz.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            {biz.contact?.phone || 'No phone'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{biz.category}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {biz.address?.locality}, {biz.address?.city}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{biz.averageRating ? biz.averageRating.toFixed(1) : 'New'}</span>
                        <span className="text-slate-400 font-normal">({biz.totalReviews || 0})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          biz.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : biz.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {biz.status === 'approved'
                          ? 'Approved'
                          : biz.status === 'pending'
                          ? 'Under Review'
                          : 'Rejected'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/business/${biz._id}`}
                        className="inline-flex p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/owner/edit/${biz._id}`}
                        className="inline-flex p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Listing"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(biz._id, biz.name)}
                        className="inline-flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
