import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Home } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-text-primary text-white flex-col justify-between p-12 relative">
        <Link to="/" className="absolute top-[20px] right-[20px] text-white hover:text-primary transition-colors">
          <Home size={24} />
        </Link>

        <Link to="/" className="flex items-center gap-2 font-black text-xl">
          <Droplets size={28} className="text-primary" fill="currentColor" />
          RED<span className="text-primary">CONNECT</span>
        </Link>

        <div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            EVERY DROP<br />
            <span className="text-primary">COUNTS.</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Sign in to connect with blood donors across Kerala and save lives in your district.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['14 Districts', '8 Blood Groups', '< 5min Response', 'AI Guided'].map((s) => (
            <div key={s} className="border border-white/20 px-4 py-3">
              <p className="text-sm font-medium text-gray-300">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 font-black text-xl mb-8 lg:hidden">
            <Droplets size={24} className="text-primary" fill="currentColor" />
            RED<span className="text-primary">CONNECT</span>
          </Link>

          <h2 className="text-3xl font-black mb-1">Sign In</h2>
          <p className="text-text-muted text-sm mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-60"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-text-muted text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
