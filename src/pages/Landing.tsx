import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LayoutDashboard, Wallet, UserPlus, ArrowRight, MessageCircle, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div>
            <span className="text-3xl font-black tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              <span className="text-accent">Vasa</span>
              <span style={{ color: '#7d9fad' }}>thi.</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-medium hidden sm:flex" onClick={() => navigate('/login?type=resident')}>
              Resident Login
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 rounded-full font-bold shadow-lg shadow-accent/10" onClick={() => navigate('/login?type=admin')}>
              Partner Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Smart PG Management" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm mb-6 border border-accent/20">
                <Zap className="h-4 w-4 fill-current" />
                <span>Smart PG Management Platform</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.1] tracking-tight mb-8">
                Simplify Your <br />
                <span className="text-accent animate-pulse">PG Operations</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-12 font-medium leading-relaxed max-w-xl">
                The all-in-one solution for PG owners. Manage residents, automate rent collection, and scale your business effortlessly with Vasathi.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-black text-xl px-12 h-16 rounded-2xl shadow-2xl shadow-accent/30 transition-all hover:scale-105" onClick={() => navigate('/login?type=admin')}>
                  List Your PG <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <div className="flex items-center gap-4 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium py-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                    <span className="text-muted-foreground">Trusted by 500+ Owners</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-muted-foreground opacity-50">
          <span className="text-xs font-bold uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-display font-black text-foreground mb-6">Built for Growth <br />Designed for Ease</h2>
              <p className="text-xl text-muted-foreground font-medium">Vasathi empowers you with enterprise-grade tools to manage your properties, payments, and people—all in one place.</p>
            </div>
            <Button variant="outline" className="rounded-full px-8 h-12 border-2 hover:bg-slate-100" onClick={() => navigate('/login?type=admin')}>Explore Features</Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: LayoutDashboard, title: 'Central Dashboard', desc: 'Real-time overview of occupancy, revenue, and requests.', color: 'bg-blue-500' },
              { icon: Wallet, title: 'Smart Payments', desc: 'Automated rent tracking with instant receipt generation.', color: 'bg-green-500' },
              { icon: UserPlus, title: 'Digital Onboarding', desc: 'Paperless resident intake and document management.', color: 'bg-purple-500' },
              { icon: MessageCircle, title: 'Grievance Tracking', desc: 'Resolve issues faster with integrated ticketing system.', color: 'bg-accent' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6 shadow-lg shadow-current/10`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-normal">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Branding Quote */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight italic">
            "Managing multiple PGs used to be a chaos of spreadsheets. Vasathi transformed our operations into a streamlined, digital success story."
          </blockquote>
          <p className="mt-8 text-accent font-black uppercase tracking-[0.2em] text-sm">Join the Vasathi Network</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", serif' }}>Vasathi.</span>
              </div>
              <p className="max-w-sm text-slate-400 font-medium leading-relaxed">
                The premier platform for PG owners. We simplify property management so you can focus on providing great experiences.
              </p>
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

          <div className="pt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 font-medium">© 2026 Vasathi Technologies Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-slate-500 hover:text-white transition-colors font-bold text-sm tracking-wide">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
