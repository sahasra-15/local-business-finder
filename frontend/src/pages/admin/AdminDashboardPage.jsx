import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Star,
  Search,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { getBusinessDisplayImage, getCategoryFallbackImage } from '../../utils/categoryImages';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'reviews' | 'users' | 'duplicates'
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bizRes, dupRes] = await Promise.all([
        adminService.getStats(),
        adminService.getBusinesses({ search: businessSearch }),
        adminService.getDuplicates(),
      ]);
      setStats(statsRes.data);
      setBusinesses(bizRes.data.businesses || []);
      setDuplicates(dupRes.data.duplicates || []);

      if (activeTab === 'reviews') {
        const revRes = await adminService.getReviews();
        setReviews(revRes.data.reviews || []);
      } else if (activeTab === 'users') {
        const uRes = await adminService.getUsers();
        setUsers(uRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin console data:', err);
      toast.error('Error loading administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSearch = async (term) => {
    try {
      const bizRes = await adminService.getBusinesses({ search: term });
      setBusinesses(bizRes.data.businesses || []);
    } catch (err) {
      console.error('Failed to filter admin businesses:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminService.updateBusinessStatus(id, { status: newStatus });
      toast.success(`Business status updated to ${newStatus}`);
      setBusinesses((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
      // Refresh stats
      const statsRes = await adminService.getStats();
      setStats(statsRes.data);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administration Console
          </h1>
          <p className="text-sm text-slate-500">
            Platform governance, listing approval workflows, review moderation, and user oversight.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Businesses
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalBusinesses}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">
              {stats.approvedBusinesses} active & approved
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Approval
            </span>
            <span className="text-2xl font-black text-amber-600">{stats.pendingBusinesses}</span>
            <span className="text-[11px] text-slate-400 font-medium block">Awaiting review</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
            <span className="text-[11px] text-slate-400 font-medium block">Registered accounts</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Business Owners
            </span>
            <span className="text-2xl font-black text-teal-600">{stats.ownerCount}</span>
            <span className="text-[11px] text-slate-400 font-medium block">Merchant accounts</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Reviews
            </span>
            <span className="text-2xl font-black text-indigo-600">{stats.totalReviews}</span>
            <span className="text-[11px] text-slate-400 font-medium block">Community ratings</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('businesses')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'businesses'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Listings ({businesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reviews Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'duplicates'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Duplicate Detector ({duplicates.length})</span>
        </button>
      </div>

      {/* Tab 1: Business Listings */}
      {activeTab === 'businesses' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={businessSearch}
                onChange={(e) => {
                  setBusinessSearch(e.target.value);
                  handleBusinessSearch(e.target.value);
                }}
                placeholder="Search business by name, locality, city, category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {businesses.length} listings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Business</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Locality</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((biz) => (
                  <tr key={biz._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getBusinessDisplayImage(biz)}
                          alt={biz.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getCategoryFallbackImage(biz.category, biz.name);
                          }}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <Link
                            to={`/business/${biz._id}`}
                            className="font-bold text-slate-900 hover:text-teal-600 text-xs block"
                          >
                            {biz.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">{biz.contact?.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{biz.category}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {biz.address?.locality || 'Hyderabad'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {biz.owner?.name || 'Owner'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          biz.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : biz.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {biz.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      {biz.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(biz._id, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {biz.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(biz._id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                      <Link
                        to={`/business/${biz._id}`}
                        className="inline-flex p-1 text-slate-400 hover:text-teal-600 transition"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Business</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Review Content</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {rev.user?.name || 'Customer'}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {rev.business?.name || 'Business'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-sm truncate">
                      {rev.reviewText}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={async () => {
                          if (!window.confirm('Delete this inappropriate review?')) return;
                          await adminService.deleteReview(rev._id);
                          toast.success('Review removed.');
                          setReviews((prev) => prev.filter((r) => r._id !== rev._id));
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Review"
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

      {/* Tab 3: User Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{u.name}</td>
                    <td className="py-4 px-6 text-slate-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{u.phone || '—'}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Duplicate Detector */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Smart Duplicate Heuristics:</strong> Scans listing database for identical contact phone numbers or matching business titles within the same neighborhood to prevent spam or fragmented ratings.
              </span>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition cursor-pointer shrink-0"
            >
              Re-scan
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {duplicates.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Duplicate Listings Found</h3>
                <p className="text-xs text-slate-500">
                  All active and pending businesses have unique contact information and distinct local titles.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-6">Match Type & Confidence</th>
                      <th className="py-4 px-6">Original Listing (A)</th>
                      <th className="py-4 px-6">Suspected Duplicate (B)</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {duplicates.map((dup, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 block">{dup.reason}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            Matched: {dup.field}
                          </span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Confidence: {dup.confidence}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {dup.businessA?.name || 'Listing A'}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {dup.businessA?.address?.locality}, {dup.businessA?.address?.city}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Status: {dup.businessA?.status}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {dup.businessB?.name || 'Listing B'}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {dup.businessB?.address?.locality}, {dup.businessB?.address?.city}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Status: {dup.businessB?.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          {dup.businessB?._id && (
                            <Link
                              to={`/business/${dup.businessB._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {dup.businessB?._id && dup.businessB.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(dup.businessB._id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition cursor-pointer"
                            >
                              Reject Duplicate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
