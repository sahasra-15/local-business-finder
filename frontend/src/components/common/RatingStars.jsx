import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  totalReviews = null,
  size = 'md',
  interactive = false,
  onChange = null,
  showNumber = true,
}) {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentSize = starSizes[size] || starSizes.md;

  // Non-interactive empty state: show "No reviews yet"
  if (!interactive && (totalReviews === 0 || (rating === 0 && (totalReviews === null || totalReviews === 0)))) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <Star className={`${currentSize} text-slate-300 fill-slate-100`} />
        <span className="text-xs font-medium text-slate-500">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = rating >= starValue;
          const isHalf = !isFilled && rating >= starValue - 0.5;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : 'cursor-default'
              } p-0.5 focus:outline-none`}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {rating > 0 ? Number(rating).toFixed(1) : 'No reviews'}
        </span>
      )}

      {totalReviews !== null && totalReviews > 0 && (
        <span className="text-xs text-slate-500 font-normal">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
