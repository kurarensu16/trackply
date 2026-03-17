import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Briefcase, Bot, FileText, BarChart3, UserCircle, ShieldCheck, Zap } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0C4A6E] font-sans selection:bg-primary/10 overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#BAE6FD]/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#0C4A6E]">Trackply</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-bold text-[#64748B]">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#stack" className="hover:text-primary transition-colors">Stack</a>
          </div>

          <button 
            onClick={() => navigate("/auth")}
            className="bg-primary text-white px-4 py-1.5 rounded-lg text-[13px] font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-6 relative overflow-hidden">
          {/* Background Dot Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#BAE6FD 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
               }} 
          />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-[#0C4A6E] mb-5 leading-[1.1] tracking-tight max-w-3xl mx-auto">
              Track every application.<br />
              Land the <span className="text-primary italic font-serif relative">right<div className="absolute -bottom-1 left-0 w-full h-1 bg-primary/20 rounded-full blur-sm" /></span> role.
            </h1>
            
            <p className="text-sm md:text-base text-[#64748B] font-medium max-w-xl mx-auto mb-8 leading-relaxed">
              Trackply helps freelance developers organize job applications, understand job descriptions instantly, and identify skill gaps — all in one focused workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <button 
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-black text-sm shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" /> Start Tracking Free
              </button>
              <button className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#BAE6FD] text-[#0C4A6E] rounded-lg font-black text-sm hover:bg-[#F0F9FF] transition-all flex items-center justify-center gap-2 shadow-sm">
                See how it works →
              </button>
            </div>

            {/* Browser Mockup */}
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-white border border-[#BAE6FD] rounded-xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col">
                {/* Browser Header */}
                <div className="h-12 bg-[#F8FAFC] border-b border-[#BAE6FD] flex items-center px-6 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="mx-auto bg-white border border-[#BAE6FD] rounded-md px-10 py-1 text-[10px] font-bold text-[#94A3B8]">
                    app.trackply.io/pipeline
                  </div>
                </div>
                {/* Internal App Content (Mockup representation) */}
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-48 border-r border-[#BAE6FD] p-6 space-y-4 hidden md:block">
                    <div className="h-3 bg-primary/10 rounded-full w-3/4 mb-10" />
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-2 rounded-full w-full ${i === 2 ? 'bg-primary' : 'bg-[#F1F5F9]'}`} />
                    ))}
                  </div>
                  <div className="flex-1 p-8 bg-[#F8FAFC]">
                    <div className="flex justify-between mb-10">
                      <div className="h-6 bg-[#0C4A6E] rounded-lg w-32" />
                      <div className="h-8 bg-primary rounded-lg w-24" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                          <div className="h-2 bg-[#94A3B8] rounded-full w-12" />
                          <div className="p-4 bg-white border border-[#BAE6FD] rounded-xl shadow-sm space-y-3">
                            <div className="h-3 bg-[#0C4A6E] rounded-full w-3/4" />
                            <div className="h-2 bg-[#94A3B8] rounded-full w-1/2" />
                            <div className="flex gap-1">
                              <div className="w-3 h-3 rounded-full bg-primary/20" />
                              <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 px-6 relative overflow-hidden">
          {/* Background Dot Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#BAE6FD 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
               }} 
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">How it works</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0C4A6E] tracking-tight">
                From posting to pipeline<br />in three steps
              </h2>
              <p className="mt-3 text-[#64748B] text-[13px] font-medium max-w-sm mx-auto">
                No complicated setup. Just paste, track, and land the role.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Lines (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#BAE6FD] to-transparent" />
              
              {[
                {
                  id: 1,
                  title: "Paste the job description",
                  desc: "Drop any job posting into Trackply. Our AI instantly summarizes the role, responsibilities, and required skills."
                },
                {
                  id: 2,
                  title: "See your skill gaps",
                  desc: "Trackply compares the job's requirements against your profile and flags exactly what you're missing."
                },
                {
                  id: 3,
                  title: "Track your pipeline",
                  desc: "Move applications across stages — Saved, Applied, Interview, Offer — and always know where you stand."
                }
              ].map((step) => (
                <div key={step.id} className="text-center space-y-3 relative z-10">
                  <div className="w-12 h-12 bg-white border border-[#BAE6FD] rounded-full mx-auto flex items-center justify-center text-lg font-black text-primary shadow-sm">
                    {step.id}
                  </div>
                  <h3 className="text-base font-bold text-[#0C4A6E] tracking-tight">{step.title}</h3>
                  <p className="text-[#64748B] text-[13px] font-medium leading-relaxed px-4">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-16 bg-white/50 border-y border-[#BAE6FD]/30 px-6 relative overflow-hidden">
          {/* Background Dot Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#BAE6FD 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
               }} 
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Features</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0C4A6E] tracking-tight">
                Everything a freelance<br />developer needs
              </h2>
              <p className="mt-3 text-[#64748B] text-[13px] font-medium max-w-sm mx-auto">
                Built for developers who apply to multiple roles and need clarity, not noise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Briefcase, title: "Kanban Pipeline Board", desc: "Drag and drop applications across five stages. See your entire job search at a glance, from Saved to Offer." },
                { icon: Bot, title: "AI Job Summarizer", desc: "Paste any job description and get a clean structured summary — overview, responsibilities, and required skills — in seconds." },
                { icon: Zap, title: "Skill Gap Detection", desc: "Know exactly what skills you're missing for each role. Trackply compares job requirements against your profile automatically." },
                { icon: BarChart3, title: "Dashboard & Stats", desc: "Track your response rate, interview conversion, and most demanded skills across all your applications." },
                { icon: UserCircle, title: "Developer Profile", desc: "Set your title, bio, and skill stack once. Trackply uses your profile to personalize every AI analysis for you." },
                { icon: ShieldCheck, title: "Private & Secure", desc: "Your applications are scoped to your account only. Built with Convex Auth — no third party data sharing." }
              ].map((feature, i) => (
                <div key={i} className="p-5 bg-white border border-[#BAE6FD] rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group">
                  <div className="w-8 h-8 bg-[#F0F9FF] text-primary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-[#0C4A6E] mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-[#64748B] text-[12px] font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center p-8 bg-primary rounded-2xl text-white shadow-2xl shadow-primary/40 relative overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            
            <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight relative z-10 leading-tight">
              Ready to take the next<br />step in your career?
            </h2>
            <p className="text-white/80 font-bold text-[13px] mb-6 max-w-md mx-auto relative z-10">
              Join Trackply today and start tracking your journey with the power of integrated AI.
            </p>
            <button 
              onClick={() => navigate("/auth")}
              className="px-6 py-2.5 bg-white text-primary rounded-lg font-black text-sm shadow-2xl hover:bg-[#F0F9FF] transition-all active:scale-95 relative z-10 inline-flex items-center gap-2.5"
            >
              Start Tracking Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">Trackply</span>
              </div>
              <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed">
                The intelligent career operations system for freelance developers.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Platform</h4>
                <div className="flex flex-col gap-2 text-xs font-bold text-slate-400">
                  <a href="#" className="hover:text-primary transition-colors">Features</a>
                  <a href="#" className="hover:text-primary transition-colors">How it works</a>
                  <a href="#" className="hover:text-primary transition-colors">Integrations</a>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Company</h4>
                <div className="flex flex-col gap-2 text-xs font-bold text-slate-400">
                  <a href="#" className="hover:text-primary transition-colors">About</a>
                  <a href="#" className="hover:text-primary transition-colors">Careers</a>
                  <a href="#" className="hover:text-primary transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              © 2026 Trackply Operations. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
