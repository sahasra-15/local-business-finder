import { Star } from 'lucide-react';

export default function RatingDistribution({ distribution = {}, totalReviews = 0 }) {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      {stars.map((starNum) => {
        const count = distribution[starNum] || 0;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div key={starNum} className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 w-10 shrink-0 font-semibold text-slate-700">
              <span>{starNum}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>

            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="w-10 text-right text-slate-400 text-[11px] shrink-0 font-medium">
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
