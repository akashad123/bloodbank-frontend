import React from 'react';
import { Droplets } from 'lucide-react';

export default function PageLoader({ message = 'Loading content...' }) {
  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-center min-h-[350px] p-6 text-center"
      style={{ borderRadius: 0 }}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer subtle pulse ring */}
        <div
          className="w-12 h-12 border-2 border-primary/20 animate-ping absolute"
          style={{ borderRadius: 0 }}
        />
        {/* Main sharp spinner */}
        <div
          className="w-10 h-10 border-2 border-gray-200 border-t-primary animate-spin flex items-center justify-center bg-white shadow-sm"
          style={{ borderRadius: 0 }}
        >
          <Droplets size={16} className="text-primary animate-pulse" />
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
        {message}
      </p>
      <span className="text-[11px] text-text-muted mt-0.5">
        RED<span className="text-primary font-bold">CONNECT</span>
      </span>
    </div>
  );
}
