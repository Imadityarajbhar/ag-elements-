import React from 'react';

export function TrustBadges() {
  return (
    <div className="flex flex-col gap-4 py-6 border-y border-outline-variant/30 mt-4">
      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-y-6 gap-x-4">
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">Authenticity<br/>Certificate</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">925<br/>Hallmark</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">6-Month<br/>Warranty</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">Secure<br/>Payments</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">sync_alt</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">7-Day<br/>Returns</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center group">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-ag-purple group-hover:bg-ag-purple group-hover:text-pearl-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <span className="font-label-sm text-[11px] font-bold text-charcoal-navy uppercase tracking-widest leading-tight">Delivery<br/>Promise</span>
        </div>
      </div>
    </div>
  );
}
