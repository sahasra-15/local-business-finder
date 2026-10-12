import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  businessName = 'Business',
  submitting = false,
}) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 5);
      setReviewText(initialData.reviewText || '');
    } else {
      setRating(5);
      setReviewText('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setError('Review comment must be at least 5 characters long.');
      return;
    }
    setError('');
    onSubmit({ rating, reviewText: reviewText.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Review for ${businessName}` : `Review ${businessName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <RatingStars
              rating={rating}
              size="lg"
              interactive={true}
              onChange={(newRating) => setRating(newRating)}
              showNumber={false}
            />
            <span className="text-sm font-bold text-slate-700">
              {rating === 5
                ? '5 - Excellent!'
                : rating === 4
                ? '4 - Very Good'
                : rating === 3
                ? '3 - Average'
                : rating === 2
                ? '2 - Poor'
                : '1 - Terrible'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Your Feedback & Experience
          </label>
          <textarea
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Describe the food, quality, customer service, pricing, and overall impression..."
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 placeholder-slate-400 outline-none transition"
            maxLength={1000}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Minimum 5 characters</span>
            <span>{reviewText.length}/1000 characters</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" size="sm" loading={submitting}>
            {initialData ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
