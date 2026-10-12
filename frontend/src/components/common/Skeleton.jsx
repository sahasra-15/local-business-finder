export function BusinessCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      <div className="h-48 bg-slate-200 w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
            <div className="h-4 w-16 bg-slate-200 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BusinessDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-10 w-2/5 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-96 bg-slate-200 rounded-2xl" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
