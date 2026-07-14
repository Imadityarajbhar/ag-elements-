export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center bg-surface-lavender">
          <span className="material-symbols-outlined text-primary text-[32px]">diamond</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-32 bg-surface-variant rounded"></div>
          <div className="h-3 w-48 bg-surface-container rounded"></div>
        </div>
      </div>
    </div>
  );
}
