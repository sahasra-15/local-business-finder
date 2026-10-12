import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page or business listing you are searching for might have moved or does not exist.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
