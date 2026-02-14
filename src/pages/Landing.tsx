import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Building2, LayoutDashboard, Wallet, UserPlus, ArrowRight, MessageCircle, Star, Zap, Shield, Clock, ChevronRight, TrendingUp, Users, Home, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
import { useRef, useEffect, useState } from 'react';

// Animated Counter Component
const AnimatedCounter = ({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: LayoutDashboard, title: 'Central Dashboard', desc: 'Real-time overview of occupancy, revenue, and requests across all your PGs.', color: 'from-blue-500 to-blue-600', num: '01' },
    { icon: Wallet, title: 'Smart Payments', desc: 'Automated rent tracking with instant receipt generation and payment history.', color: 'from-emerald-500 to-emerald-600', num: '02' },
    { icon: UserPlus, title: 'Digital Onboarding', desc: 'Paperless resident intake with document management and ID verification.', color: 'from-violet-500 to-violet-600', num: '03' },
    { icon: MessageCircle, title: 'Grievance Tracking', desc: 'Resolve issues faster with an integrated ticketing and escalation system.', color: 'from-amber-500 to-amber-600', num: '04' },
  ];

  const steps = [
    { icon: Home, title: 'Register Your PG', desc: 'Add your properties, floors, and rooms in minutes with our intuitive setup wizard.' },
    { icon: Users, title: 'Onboard Residents', desc: 'Digital intake forms, Aadhar verification, and instant room assignment.' },
    { icon: TrendingUp, title: 'Manage & Grow', desc: 'Track payments, resolve grievances, and scale your operations effortlessly.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Premium Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center cursor-pointer"
          >
            <span className="text-3xl font-black tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="text-accent drop-shadow-[0_0_12px_rgba(233,196,106,0.3)]">Vasathi</span>
              <span style={{ color: '#cadee7' }}>.</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-2">
              {['Features', 'Pricing', 'Support'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -1 }}
                  className="px-3 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="w-px h-6 bg-white/10 hidden md:block mx-2" />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="hidden sm:flex font-semibold text-white/90 border-white/20 hover:border-white/40 hover:bg-white/10 rounded-full px-5 gap-2 transition-all bg-transparent"
                onClick={() => navigate('/login?type=resident')}
              >
                <UserPlus className="h-4 w-4" />
                Resident
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 rounded-full font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all gap-2"
                onClick={() => navigate('/login?type=admin')}
              >
                Partner Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      </motion.nav>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Smart PG Management" className="w-full h-full object-cover animate-slow-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-blue-500/8 blur-[120px] animate-float-medium" />
          <div className="absolute top-2/3 right-1/3 w-64 h-64 rounded-full bg-emerald-500/8 blur-[80px] animate-float-fast" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-bold text-sm mb-8 border border-accent/30 backdrop-blur-sm">
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Smart PG Management Platform</span>
                </div>
              </motion.div>

              {/* Headline — each line staggered */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-8xl font-display font-black leading-[1.05] tracking-tight mb-8 text-white"
              >
                Simplify Your <br />
                <span className="text-accent drop-shadow-[0_0_30px_rgba(233,196,106,0.3)]">
                  PG Operations
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-xl sm:text-2xl text-white/70 mb-12 font-medium leading-relaxed max-w-xl"
              >
                The all-in-one solution for PG owners. Manage residents, automate rent collection, and scale your business effortlessly.
              </motion.p>

              {/* CTA Row */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-black text-xl px-12 h-16 rounded-2xl shadow-2xl shadow-accent/30 transition-all animate-glow-pulse"
                    onClick={() => navigate('/login?type=admin')}
                  >
                    List Your PG <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </motion.div>
                <div className="flex items-center gap-4 px-5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium py-3">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                    <span className="text-white/60">Trusted by 500+ Owners</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs font-bold uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* STATS COUNTER BAR */}
      {/* ============================================ */}
      <section className="relative z-10 -mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-slate-100 p-8 sm:p-10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 500, suffix: '+', label: 'PGs Managed', icon: Building2 },
                { value: 10000, suffix: '+', label: 'Happy Residents', icon: Users },
                { value: 2, suffix: 'Cr+', prefix: '₹', label: 'Rent Processed', icon: Wallet },
                { value: 99, suffix: '%', label: 'Uptime', icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-foreground mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES GRID */}
      {/* ============================================ */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative bg elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-6 border border-accent/20">
              <Zap className="h-3.5 w-3.5 fill-current" />
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-foreground mb-6">
              Built for Growth<span className="text-accent">.</span><br />
              Designed for Ease<span className="text-accent">.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Enterprise-grade tools to manage your properties, payments, and people—all in one platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start relative overflow-hidden transition-shadow hover:shadow-xl hover:border-accent/20"
              >
                {/* Number badge */}
                <span className="absolute top-6 right-6 text-6xl font-black text-slate-100 group-hover:text-accent/10 transition-colors select-none">
                  {f.num}
                </span>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed relative z-10">{f.desc}</p>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent/50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-6 border border-accent/20">
              <Clock className="h-3.5 w-3.5" />
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-foreground mb-6">
              Three Steps to<br />
              <span className="text-accent">Smarter Management</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-accent/30 via-accent to-accent/30" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative text-center group"
              >
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors flex items-center justify-center border-2 border-accent/30 group-hover:border-accent/60 relative z-10 bg-white">
                    <step.icon className="h-8 w-8 text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground font-black text-sm flex items-center justify-center shadow-lg z-20">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIAL */}
      {/* ============================================ */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 text-center relative"
        >
          {/* Large quote mark */}
          <div className="text-accent/20 text-[120px] sm:text-[180px] leading-none font-display font-black absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 select-none pointer-events-none">
            "
          </div>

          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight relative z-10 mb-10">
            "Managing multiple PGs used to be chaos. Vasathi transformed our operations into a streamlined, digital success story."
          </blockquote>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-accent/30">
              <img src="https://i.pravatar.cc/150?u=testimonial" alt="Testimonial" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Rajesh Kumar</p>
              <p className="text-sm text-muted-foreground">Owner, 12 PGs across Hyderabad</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-yellow-500">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] animate-float-medium" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 text-center relative z-10"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white mb-8 leading-tight">
            Ready to Transform<br />
            Your <span className="text-accent drop-shadow-[0_0_30px_rgba(233,196,106,0.3)]">PG Business</span>?
          </h2>
          <p className="text-xl text-white/60 mb-12 font-medium max-w-xl mx-auto">
            Join 500+ property owners who are already saving time, increasing revenue, and delivering better living experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-black text-xl px-12 h-16 rounded-2xl shadow-2xl shadow-accent/30 animate-glow-pulse gap-3"
                onClick={() => navigate('/login?type=admin')}
              >
                Get Started Free <ArrowRight className="h-6 w-6" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-bold text-xl px-12 h-16 rounded-2xl bg-transparent gap-3"
                onClick={() => navigate('/login?type=resident')}
              >
                I'm a Resident <ChevronRight className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-16">
            {[
              { icon: Shield, text: 'Bank-Grade Security' },
              { icon: Clock, text: '24/7 Support' },
              { icon: CheckCircle2, text: 'No Setup Fee' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-white/40 text-sm font-medium">
                <badge.icon className="h-4 w-4" />
                {badge.text}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-3xl font-black tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                    <span className="text-accent">Vasathi</span><span className="text-slate-500">.</span>
                  </span>
                </div>
                <p className="max-w-sm text-slate-400 font-medium leading-relaxed mb-6">
                  The premier platform for PG owners. We simplify property management so you can focus on providing great experiences.
                </p>
                <div className="flex gap-3">
                  {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                    <a key={social} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent/30 flex items-center justify-center text-slate-400 hover:text-accent transition-all text-xs font-bold">
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Platform</h4>
                <ul className="space-y-4 text-slate-400 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">For Owners</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Support</h4>
                <ul className="space-y-4 text-slate-400 font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Sales</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-slate-500 font-medium text-sm">© 2026 Vasathi Technologies Pvt Ltd. All rights reserved.</p>
              <p className="text-slate-600 text-xs font-medium">Made with ❤️ in Hyderabad</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
