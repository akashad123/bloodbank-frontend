import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Reusable back/home button — fixed top-left.
 * Navigates back in history if possible, otherwise falls back to "/".
 */
export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 0.875rem',
        backgroundColor: '#CD0000',
        color: '#ffffff',
        border: 'none',
        borderRadius: 0,
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.85';
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <ArrowLeft size={15} strokeWidth={2.5} />
      Back
    </button>
  );
}
