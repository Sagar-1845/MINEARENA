import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ContactSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    email: '',
    region: 'Western Cyber Perimeter (BKC)',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orgName || !formData.email) {
      toast.error('Please enter your organization name and work email.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        'Inquiry Transmitted to ZeroLeak Enclave. Our perimeter team will reply within 4 hours.'
      );
      setFormData({
        orgName: '',
        email: '',
        region: 'Western Cyber Perimeter (BKC)',
        message: '',
      });
    }, 900);
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-36 px-6 sm:px-12 md:px-16 border-t border-[#D5E0FF]/15 relative bg-[#020A19]/85 backdrop-blur-md text-[#D5E0FF]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <Badge
              variant="outline"
              className="border-saffron/40 text-saffron font-mono text-xs mb-3"
            >
              <Mail className="w-3.5 h-3.5 mr-1" /> // DROP US A LINE
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              Initiate Secure <br />
              <span className="saffron-gradient-text">Enquiry.</span>
            </h2>
          </div>

          <p className="text-sm font-mono text-muted-foreground max-w-sm">
            Modeled after Hubtown corporate contact desks, routing inquiries
            directly to our regional perimeter engineering squads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
          {/* Left Column: Dark Architectural Form */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 font-bold">
                  Enterprise / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India, Apollo Hospitals, Infosys"
                  value={formData.orgName}
                  onChange={(e) =>
                    setFormData({ ...formData, orgName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 font-bold">
                  Work Email (Corporate Domain) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="security-lead@enterprise.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 font-bold">
                  Target Deployment Corridor
                </label>
                <select
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 text-foreground font-mono text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                >
                  <option value="Western Cyber Perimeter (BKC)">
                    Western Cyber Perimeter (BKC Core)
                  </option>
                  <option value="South Financial Vaults (Nariman Point)">
                    South Financial Vaults (Nariman Point)
                  </option>
                  <option value="Central Cloud Shield (Powai Tech Hub)">
                    Central Cloud Shield (Powai Tech Hub)
                  </option>
                  <option value="Northern Air-Gapped Hubs (Thane)">
                    Northern Air-Gapped Hubs (Thane Datacenter)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 font-bold">
                  Application Architecture & Volume Scope
                </label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe your foundation model pipeline (e.g. Azure OpenAI, Vertex AI) and Indian PII entity volumes."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="saffron"
                size="lg"
                className="w-full h-12 font-bold font-mono text-sm shadow-saffron-glow rounded-xl gap-2 hover:scale-[1.02] transition-transform"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'TRANSMITTING ENCRYPTED PACKET...' : 'DROP US A LINE'}
                </span>
              </Button>
            </form>
          </div>

          {/* Right Column: Physical Enclave Directory & Regional Hotlines */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-neon font-bold uppercase mb-2">
                  <MapPin className="w-4 h-4 text-neon" />
                  <span>MUMBAI HEADQUARTERS</span>
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Sovereign Cyber Perimeter Tower
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                  Level 14, G-Block, Bandra Kurla Complex (BKC)
                  <br />
                  Mumbai, Maharashtra 400051
                </p>
                <div className="mt-3 pt-3 border-t border-border/40 text-[11px] font-mono text-foreground/80 flex justify-between">
                  <span>LAT: 19.0657° N</span>
                  <span>LONG: 72.8687° E</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-indiaGreen font-bold uppercase mb-2">
                  <MapPin className="w-4 h-4 text-indiaGreen" />
                  <span>BENGALURU RESEARCH CELL</span>
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Indiranagar Technology Perimeter
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                  100 Feet Road, HAL 2nd Stage, Indiranagar
                  <br />
                  Bengaluru, Karnataka 560038
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-saffron font-bold uppercase mb-2">
                  <Building className="w-4 h-4 text-saffron" />
                  <span>HACKATHON HOST CAMPUS</span>
                </div>
                <h4 className="font-bold text-foreground text-base">
                  Bapuji Institute of Engineering & Technology (BIET)
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                  MineArena 1.0 | Code Commit
                  <br />
                  Davangere, Karnataka 577004
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-border/60 bg-secondary/50 text-xs font-mono text-muted-foreground space-y-1">
              <p>DIRECT HOTLINE: +91 (022) 8900-LEAK</p>
              <p>RESPONSE TIME: &lt; 4 HOURS ENCRYPTED SLA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
