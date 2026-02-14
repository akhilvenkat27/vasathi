import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Shield, Wifi, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold font-display text-foreground">NestManager</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/login?type=resident')}>
              Resident Login
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate('/login?type=admin')}>
              Admin Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Modern residence" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Premium Living,{' '}
              <span className="text-accent">Simplified</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 font-body leading-relaxed">
              Modern PG management for the modern world. Streamlined operations, transparent payments, and a community-first experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8" onClick={() => navigate('/login?type=admin')}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8" onClick={() => navigate('/login?type=resident')}>
                Resident Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need for seamless PG management under one roof.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: '24/7 Security', desc: 'Round-the-clock security with CCTV surveillance and gated access.' },
              { icon: Wifi, title: 'Modern Amenities', desc: 'High-speed WiFi, laundry, housekeeping, and fully furnished rooms.' },
              { icon: Users, title: 'Vibrant Community', desc: 'Events, common areas, and a supportive community for all residents.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-xl p-8 hover-lift text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <f.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Happy Residents' },
              { value: '15+', label: 'Properties' },
              { value: '98%', label: 'Satisfaction' },
              { value: '24/7', label: 'Support' },
            ].map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <div className="text-3xl sm:text-4xl font-display font-bold text-accent mb-2">{s.value}</div>
                <div className="text-primary-foreground/70 font-body">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-foreground">NestManager</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 NestManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
