import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { businessService } from '../services/businessService';

export default function CategoriesPage() {
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await businessService.getCategories();
        const list = res.data.categories || [];
        const merged = CATEGORIES.map((cat) => {
          const found = list.find((item) => item.name === cat.name);
          return {
            ...cat,
            count: found ? found.count : 0,
          };
        });
        setCategoriesWithCount(merged);
      } catch (err) {
        console.error('Failed to load category counts:', err);
        setCategoriesWithCount(CATEGORIES.map((c) => ({ ...c, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
          Browse Business Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          All Business Categories
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Browse verified local establishments across Hyderabad by industry and specialty.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesWithCount.map((cat) => (
          <Link
            key={cat.name}
            to={`/explore?category=${encodeURIComponent(cat.name)}`}
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <Store className="w-7 h-7" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400">
                {loading ? 'Checking...' : `${cat.count} listings in Hyderabad`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
