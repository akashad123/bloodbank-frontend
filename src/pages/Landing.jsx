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
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <nav className="bg-white/90 backdrop-blur-md text-text-primary px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-1.5 sm:gap-2 font-black text-lg sm:text-xl tracking-tight shrink-0">
          <Droplets size={28} className="text-primary shrink-0" fill="currentColor" />
          <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
            <span>RED<span className="text-primary">CONNECT</span></span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-widest border-l-2 border-primary/50 pl-1.5 sm:pl-2">DYFI MOKERI EAST</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-text-secondary hover:text-primary text-sm px-4 py-2 font-bold rounded-xl">Login</Link>
          <Link to="/register" className="btn-primary py-2 text-xs rounded-xl shadow-sm">Register</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white via-primary-50/30 to-white text-text-primary">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-6 shadow-sm">
              <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              DYFI MOKERI EAST MC
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
              BLOOD WHEN<br />
              <span className="text-primary">IT MATTERS</span><br />
              MOST.
            </h1>

            <p className="text-text-secondary text-lg max-w-xl mb-10">
              Connecting blood donors with patients across Kerala's 14 districts in real-time. 
              Fast. Verified. Life-saving.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4 shadow-md">
                Register as Donor
              </Link>
              <Link to="/register" className="btn-outline text-base px-8 py-4">
                Request Blood
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blood Group Ticker */}
      <div className="bg-primary py-3 overflow-hidden shadow-sm">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...bloodGroups, ...bloodGroups].map((bg, i) => (
            <span key={i} className="text-white font-black text-2xl mx-4 opacity-90">{bg}</span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative z-10 -mt-1 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
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
              <div className="text-4xl font-black text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-text-secondary font-semibold">{stat.label}</div>
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
              className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group cursor-default"
            >
              <div className="p-3 bg-primary-50 inline-flex mb-4 group-hover:bg-primary group-hover:text-white rounded-xl transition-colors duration-300">
                <f.icon size={24} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="px-6 pb-20">
        <section className="bg-primary text-white max-w-7xl mx-auto shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
          <div className="relative max-w-7xl mx-auto px-8 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to save a life?</h2>
              <p className="text-primary-100 text-lg">Join thousands of donors across Kerala making an impact.</p>
            </div>
            <Link to="/register" className="bg-white text-primary font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex-shrink-0 text-center w-full md:w-auto">
              Get Started — It's Free
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 text-text-secondary px-6 py-10 text-sm text-center">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 text-text-primary font-black shrink-0">
          <Droplets size={20} className="text-primary shrink-0" fill="currentColor" />
          <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
            <span>RED<span className="text-primary">CONNECT</span></span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-widest border-l-2 border-primary/50 pl-1.5 sm:pl-2">DYFI MOKERI EAST</span>
          </span>
        </div>
        <p className="font-medium text-text-muted">DYFI MOKERI EAST MEGHALA COMMITTEE</p>
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
