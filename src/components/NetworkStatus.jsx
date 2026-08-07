import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnline(true);
      timeoutId = setTimeout(() => {
        setShowOnline(false);
      }, 4000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showOnline) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 pointer-events-auto"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E9ECEF',
              borderLeft: !isOnline ? '4px solid #C8102E' : '4px solid #22c55e',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: '0',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '90vw'
            }}
          >
            {!isOnline ? (
              <WifiOff size={20} style={{ color: '#C8102E' }} className="shrink-0" />
            ) : (
              <Wifi size={20} style={{ color: '#22c55e' }} className="shrink-0" />
            )}
            <span
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A1A',
                margin: 0,
                lineHeight: 1.4
              }}
            >
              {!isOnline
                ? "You're offline. Check your internet connection."
                : "You're back online."}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
