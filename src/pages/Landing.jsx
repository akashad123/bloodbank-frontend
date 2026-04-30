import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Heart, Shield, Zap, MapPin, Bot } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Emergency First', desc: 'Instant donor matching for emergency blood requests. Response within minutes.' },
  { icon: MapPin, title: 'District-Based', desc: 'Precise targeting across all 14 Kerala districts. Local, fast, reliable.' },
  { icon: Shield, title: 'Admin Verified', desc: 'Every request is verified by district admins before going live.' },
  { icon: Bot, title: 'AI Assistant', desc: 'RedConnect AI checks your eligibility and guides you through donation.' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <nav className="bg-text-primary text-white px-6 py-4 flex items-center justify-between border-b-4 border-primary">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight">
          <Droplets size={28} className="text-primary" fill="currentColor" />
          RED<span className="text-primary">CONNECT</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-white hover:bg-white/10 text-sm px-4 py-2 font-medium">Login</Link>
          <Link to="/register" className="btn-primary py-2 text-xs">Register</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-text-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-light mb-6">
              <span className="w-2 h-2 bg-primary animate-pulse" style={{ borderRadius: '50%' }} />
              Kerala Blood Donation Network
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
              BLOOD WHEN<br />
              <span className="text-primary">IT MATTERS</span><br />
              MOST.
            </h1>

            <p className="text-gray-300 text-lg max-w-xl mb-10">
              Connecting blood donors with patients across Kerala's 14 districts in real-time. 
              Fast. Verified. Life-saving.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Register as Donor
              </Link>
              <Link to="/register" className="btn-outline border-white text-white hover:bg-white hover:text-text-primary text-base px-8 py-4">
                Request Blood
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blood Group Ticker */}
      <div className="bg-primary py-3 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...bloodGroups, ...bloodGroups].map((bg, i) => (
            <span key={i} className="text-white font-black text-2xl mx-4">{bg}</span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-bg-dark border-b-2 border-bg-darker">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '14', label: 'Districts Covered' },
            { value: '8', label: 'Blood Groups' },
            { value: '< 5min', label: 'Avg Response Time' },
            { value: '24/7', label: 'Emergency Ready' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-black text-primary">{stat.value}</div>
              <div className="text-sm text-text-muted mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Why RedConnect</p>
          <h2 className="text-3xl font-black mb-12">Built for Kerala. <span className="text-primary">Built for Speed.</span></h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card border-t-4 border-t-primary hover:shadow-sharp transition-all duration-200 group cursor-default"
            >
              <div className="p-3 bg-primary/10 inline-flex mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black mb-2">Ready to save a life?</h2>
            <p className="text-red-100">Join thousands of donors across Kerala.</p>
          </div>
          <Link to="/register" className="bg-white text-primary font-black px-8 py-4 text-sm uppercase tracking-wider hover:bg-red-50 transition-colors flex-shrink-0">
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-gray-400 px-6 py-8 text-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-white font-black">
          <Droplets size={18} className="text-primary" fill="currentColor" />
          REDCONNECT
        </div>
        <p>Kerala Blood Donation Platform · All 14 Districts</p>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 12s linear infinite; }
      `}</style>
    </div>
  );
}
