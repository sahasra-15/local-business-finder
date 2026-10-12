import { Trash2, Edit2 } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function ReviewCard({ review, onEdit, onDelete }) {
  const { user, isAdmin } = useAuth();
  const isAuthor = user && review.user && (user.id === review.user._id || user._id === review.user._id);
  const canModify = isAuthor || isAdmin;

  const isDemoReview =
    review.reviewText?.includes('[Demonstration Review]') ||
    review.reviewText?.includes('[Demo Review]');
  const displayText = review.reviewText?.replace(/^\[(Demonstration|Demo) Review\]\s*/i, '') || '';

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-sm">
              {(review.user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {review.user?.name || 'Verified Customer'}
              </h4>
              {isDemoReview && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Sample Demo Review
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" showNumber={false} />

          {canModify && (
            <div className="flex items-center gap-1 ml-2">
              {isAuthor && onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Edit review"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed pt-1">
        {displayText}
      </p>
    </div>
  );
}
