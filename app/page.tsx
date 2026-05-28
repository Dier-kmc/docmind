"use client"

import { useState } from "react"
import { 
  FileText, 
  Bot, 
  Zap, 
  ShieldCheck, 
  Gauge, 
  ArrowRight, 
  CheckCircle2, 
  Quote,
  Sparkles,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"problem" | "solution">("solution")

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-32 border-b border-border/40">
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15" />
        
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-medium tracking-wide animate-fade-in">
            <Sparkles size={12} className="text-muted-foreground animate-pulse" />
            <span>Next-Gen RAG Architecture is Live</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Give a Voice to Your <span className="bg-gradient-to-r from-neutral-500 via-foreground to-neutral-700 bg-clip-text text-transparent">Documents</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Upload your PDFs, technical specs, or contracts. Chat instantly with DocMind AI to extract key insights with exact, verified citations in milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
            href="/dashboard"
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 group cursor-pointer">
              Get Started for Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            {/* <button className="w-full sm:w-auto h-11 px-6 rounded-xl border border-border bg-background font-medium text-sm hover:bg-muted/40 transition-all flex items-center justify-center gap-2 cursor-pointer">
              Watch 1-Min Demo
            </button> */}
          </div>

          {/* Double-Panel Interactive Preview */}
          <div className="mt-16 rounded-2xl border border-border bg-card shadow-2xl p-3 sm:p-4 max-w-5xl mx-auto backdrop-blur-sm">
            <div className="flex items-center justify-between px-3 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/30" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/30">
                app.docmind.ai/dashboard/spec-doc-01
              </span>
              <div className="w-8" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 h-[420px] mt-4 text-left overflow-hidden">
              {/* Left Panel: PDF Viewer Stub */}
              <div className="w-full md:w-[45%] rounded-xl border border-border bg-muted/20 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border bg-background flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="truncate">technical_specifications.pdf</span>
                  <span>Page 1 / 14</span>
                </div>
                <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs text-muted-foreground/80 leading-relaxed font-mono">
                  <p className="bg-primary/5 text-foreground/90 p-2.5 rounded-lg border border-primary/10 relative">
                    <span className="absolute -left-1 top-2 w-1 h-4 bg-primary rounded-r" />
                    <strong>[Section 4.2]</strong> The unified database framework requires an execution latency under 200ms for batch processes using vector indexing configurations...
                  </p>
                  <p>[Section 4.3] Security protocols demand strict multi-tenant isolation via dynamic cryptographic keys applied at the Row-Level Security layer...</p>
                  <p>[Section 4.4] Infrastructure metrics must track Time-To-First-Byte parameters on a distributed global CDN architecture...</p>
                </div>
              </div>

              {/* Right Panel: Chat Interface Stub */}
              <div className="flex-1 rounded-xl border border-border bg-background flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-2 text-xs font-semibold">
                  <Bot size={14} className="text-muted-foreground" />
                  <span>DocMind Core AI</span>
                </div>
                <div className="p-4 flex-1 space-y-4 text-xs overflow-y-auto">
                  <div className="flex justify-end">
                    <p className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                      What are the precise latency constraints for our architecture?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted/50 border border-border/60 p-3 rounded-2xl rounded-tl-sm max-w-[85%] space-y-2">
                      <p className="leading-relaxed">
                        According to <strong>Section 4.2</strong> of your uploaded document, the database requires a maximum processing latency of <strong>under 200ms</strong> for batch operations.
                      </p>
                      
                      {/* Inline Source Component Match */}
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground font-medium">
                          <Quote size={10} /> 1 verified source
                        </span>
                        <span className="font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          98% match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM & SOLUTION SWITCHER */}
      <section className="py-20 bg-muted/20 border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">The Frictionless Document Workspace</h2>
            <p className="text-muted-foreground text-sm">
              Traditional reading methods break down when dealing with volume. See how DocMind rewrites your workflow rules.
            </p>
            
            {/* Toggle Button */}
            <div className="inline-flex p-1 bg-card border border-border rounded-xl mt-4">
              <button 
                onClick={() => setActiveTab("solution")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "solution" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                The DocMind Solution
              </button>
              <button 
                onClick={() => setActiveTab("problem")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "problem" ? "bg-destructive/15 text-destructive shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                The Old Nightmare
              </button>
            </div>
          </div>

          {/* Conditional Grid Render */}
          {activeTab === "solution" ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <Zap size={18} />, title: "Instant Extraction", desc: "No more scrolling through 150-page reports. Ask complex questions and get structured responses in less than a second." },
                { icon: <ShieldCheck size={18} />, title: "Zero Hallucinations", desc: "Every word is backed by contextual realities. The system references the factual corpus of your own records." },
                { icon: <Gauge size={18} />, title: "Global Summaries", desc: "Convert vast document chains into actionable, executive roadmaps and plan matrix definitions instantly with one single action." }
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold tracking-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Wasted Hours", desc: "Wasting professional time using CTRL+F combinations hoping to find terms misspelled across chaotic layouts." },
                { title: "Inaccurate Claims", desc: "Relying on generic public LLMs that confabulate metrics, causing massive business verification issues." },
                { title: "Cognitive Burnout", desc: "Drowning under thousands of technical parameters when evaluating multi-million dollar proposal documents." }
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-2xl border border-border/60 bg-muted/40 opacity-75 space-y-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <h3 className="text-sm font-bold tracking-tight text-foreground/80">{item.title}</h3>
                  <p className="text-xs text-muted-foreground/90 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CORE TECHNICAL FEATURES */}
      <section className="py-20 border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Built for Mission-Critical Accuracy</h2>
            <p className="text-muted-foreground text-sm">
              We combined advanced RAG orchestration with hyper-fast inference pipelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Semantic Core</span>
                <h3 className="text-xl font-bold tracking-tight">Advanced Hybrid Retrieval Pipeline</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our algorithm processes your document through an isolated multi-tenant vector framework. It strips structural background noise (headers, indices, page numbers) to capture exact contextual significance.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  "Confidence Thresholding filtering irrelevance automatically",
                  "Optimized token allocations for rapid model streaming responses",
                  "Row-Level Security boundaries applied natively per user workspace"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Metric Card Component */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold text-muted-foreground">Engine Analytics</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Active</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-muted-foreground">Vector Math Accuracy</span>
                    <span>99.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[99.4%] bg-primary rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-muted-foreground">Time-To-First-Byte (TTFB)</span>
                    <span>140ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING TABLE */}
      <section className="py-20 bg-muted/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Simple, Value-Driven Pricing</h2>
            <p className="text-muted-foreground text-sm">
              Start parsing documents at zero cost. Upgrade as your operations scale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Tier 1: Starter */}
            <div className="border border-border bg-card rounded-2xl p-6 flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-muted-foreground">Starter Account</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">$0</span>
                    <span className="text-xs text-muted-foreground">/ forever</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Perfect for professionals evaluating individual documents.</p>
                <div className="w-full h-px bg-border/60" />
                <ul className="space-y-2.5 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">✔ Up to 3 active documents</li>
                  <li className="flex items-center gap-2">✔ 50 pages maximum per file</li>
                  <li className="flex items-center gap-2">✔ Standard RAG execution speed</li>
                  <li className="flex items-center gap-2 text-muted-foreground/60">✘ Comprehensive global summaries</li>
                </ul>
              </div>
              <button className="w-full h-10 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted/50 transition-all cursor-pointer">
                Create Free Account
              </button>
            </div>

            {/* Tier 2: Professional */}
            <div className="border-2 border-primary bg-card rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-md">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest rounded-md">
                Popular Choice
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Professional Pro</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">$14.99</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">For engineers, consultants, and teams managing heavy specifications.</p>
                <div className="w-full h-px bg-border/60" />
                <ul className="space-y-2.5 text-xs font-medium">
                  <li className="flex items-center gap-2">⚡ <strong>Unlimited</strong> uploaded documents</li>
                  <li className="flex items-center gap-2">⚡ Up to <strong>2,000 pages</strong> per file</li>
                  <li className="flex items-center gap-2">⚡ Priority access to high-tier models</li>
                  <li className="flex items-center gap-2">⚡ Multi-Router Document Summarization</li>
                  <li className="flex items-center gap-2">⚡ Dedicated priority engineering support</li>
                </ul>
              </div>
              <button className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs cursor-pointer">
                Upgrade to Professional Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CALL TO ACTION */}
      <footer className="py-20 border-t border-border/60 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--muted),transparent_60%)] opacity-30" />
        <div className="container max-w-3xl mx-auto px-4 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to Master Your Documentation?</h3>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Join professionals scaling through technical reports, auditing briefs, and specifications with absolute security boundaries.
          </p>
          <div className="pt-2">
            <button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:opacity-90 transition-all inline-flex items-center gap-2 cursor-pointer group">
              Get Started Instantly
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground/60 pt-12">
            © {new Date().getFullYear()} DocMind AI. All rights reserved. Secure multi-tenant architecture tracking metadata integrity.
          </div>
        </div>
      </footer>
      
    </div>
  )
}



























// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { 
//   FileText, 
//   Sparkles, 
//   CheckCircle2, 
//   ArrowRight, 
//   ShieldCheck, 
//   Share2, 
//   Briefcase 
// } from "lucide-react"

// export default function Home() {
//   return (
//     <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      
//       {/* 1. Header / Navigation */}
//       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
//         <div className="container mx-auto max-w-6xl h-14 flex items-center justify-between px-4">
//           <div className="flex items-center gap-2">
//             <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
//               F
//             </div>
//             <span className="font-bold text-lg tracking-tight">Flowfolio</span>
//           </div>
//           <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
//             <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
//             <a href="#how-it-works" className="hover:text-foreground transition-colors">Comment ça marche</a>
//             <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
//           </nav>
//           <div className="flex items-center gap-3">
//             <Link href="/login">
//               <Button variant="ghost" size="sm">Connexion</Button>
//             </Link>
//             <Link href="/register">
//               <Button size="sm">Essai gratuit</Button>
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* 2. Hero Section */}
//       <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
//         <div className="container mx-auto max-w-4xl px-4 text-center relative z-10 space-y-6">
//           <Badge variant="secondary" className="px-3 py-1 gap-1.5 text-xs font-medium animate-fade-in">
//             <Sparkles size={12} className="text-primary fill-primary/20" />
//             Génération de portfolio propulsée par l'IA
//           </Badge>
          
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
//             Transformez vos documents en un <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Portfolio Web</span> percutant
//           </h1>
          
//           <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
//             Téléversez vos CV ou documents professionnels. Notre IA extrait votre expertise pour générer un portfolio en ligne unique, complété par des témoignages clients certifiés.
//           </p>

//           <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link href="/register" className="w-full sm:w-auto">
//               <Button size="lg" className="w-full sm:w-auto text-sm font-semibold gap-2 shadow-lg shadow-primary/20">
//                 Générer mon portfolio <ArrowRight size={16} />
//               </Button>
//             </Link>
//             <a href="#features" className="w-full sm:w-auto">
//               <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold">
//                 Voir les exemples
//               </Button>
//             </a>
//           </div>

//           {/* Faux Preview de l'App (Dashboard/Portfolio) */}
//           <div className="mt-12 md:mt-16 rounded-2xl border border-border/80 bg-muted/30 p-2 shadow-2xl backdrop-blur-sm">
//             <div className="rounded-xl border border-border bg-background shadow-inner overflow-hidden aspect-[16/9] flex flex-col">
//               <div className="h-8 border-b border-border bg-muted/40 flex items-center px-4 gap-1.5 shrink-0">
//                 <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
//                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
//                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
//                 <div className="h-4 w-40 bg-muted rounded mx-auto" />
//               </div>
//               <div className="flex-1 bg-background flex items-center justify-center opacity-70">
//                 <div className="text-center space-y-2">
//                   <FileText size={32} className="mx-auto text-muted-foreground/60 animate-pulse" />
//                   <p className="text-xs text-muted-foreground font-medium">Aperçu interactif de votre portfolio généré...</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 3. Features Section (Grille 2x2) */}
//       <section id="features" className="py-16 md:py-24 border-t border-border/40 bg-muted/10">
//         <div className="container mx-auto max-w-5xl px-4 space-y-12">
//           <div className="text-center space-y-3">
//             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pensé pour les Freelances et Développeurs exigeants</h2>
//             <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
//               Arrêtez de perdre du temps à coder votre portfolio. Concentrez-vous sur vos clients, Flowfolio s'occupe du reste.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6">
//             {/* Feature 1 */}
//             <div className="border border-border/60 bg-background rounded-2xl p-6 space-y-4 shadow-sm">
//               <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
//                 <Sparkles size={18} />
//               </div>
//               <h3 className="font-semibold text-base">Le Cerveau Logique (IA)</h3>
//               <p className="text-muted-foreground text-sm leading-relaxed">
//                 Notre IA ingère vos fichiers complexes (CV, livrables) et structure vos compétences, projets majeurs et stack technique de façon ultra-pro.
//               </p>
//             </div>

//             {/* Feature 2 */}
//             <div className="border border-border/60 bg-background rounded-2xl p-6 space-y-4 shadow-sm">
//               <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
//                 <ShieldCheck size={18} />
//               </div>
//               <h3 className="font-semibold text-base">Témoignages Vérifiés</h3>
//               <p className="text-muted-foreground text-sm leading-relaxed">
//                 Intégrez des avis clients authentifiés via un lien sécurisé. Vos futurs recruteurs ont la certitude que vos recommandations sont 100% réelles.
//               </p>
//             </div>

//             {/* Feature 3 */}
//             <div className="border border-border/60 bg-background rounded-2xl p-6 space-y-4 shadow-sm">
//               <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
//                 <Share2 size={18} />
//               </div>
//               <h3 className="font-semibold text-base">Export & Partage Instantané</h3>
//               <p className="text-muted-foreground text-sm leading-relaxed">
//                 Diffusez votre portfolio via un lien public optimisé SEO ou téléchargez un CV PDF haut de gamme généré dynamiquement à partir de votre profil.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 4. Workflow Section */}
//       <section id="how-it-works" className="py-16 md:py-24 border-t border-border/40">
//         <div className="container mx-auto max-w-4xl px-4 space-y-12">
//           <div className="text-center space-y-3">
//             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">De l'ombre à la lumière en 3 étapes</h2>
//           </div>

//           <div className="relative border-l border-border/80 ml-4 md:ml-32 space-y-10 pl-6">
//             {/* Étape 1 */}
//             <div className="relative">
//               <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
//               <h4 className="font-semibold text-sm text-primary uppercase tracking-wider mb-1">Étape 1</h4>
//               <h3 className="font-bold text-lg text-foreground">Importez vos documents</h3>
//               <p className="text-muted-foreground text-sm max-w-md mt-1">
//                 Glissez votre ancien CV, une proposition technique ou une description LinkedIn.
//               </p>
//             </div>

//             {/* Étape 2 */}
//             <div className="relative">
//               <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
//               <h4 className="font-semibold text-sm text-primary uppercase tracking-wider mb-1">Étape 2</h4>
//               <h3 className="font-bold text-lg text-foreground">Laissez l'IA orchestrer le design</h3>
//               <p className="text-muted-foreground text-sm max-w-md mt-1">
//                 Flowfolio extrait le meilleur et génère une interface moderne avec filtres par projets, tags de compétences et chronologie épurée.
//               </p>
//             </div>

//             {/* Étape 3 */}
//             <div className="relative">
//               <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
//               <h4 className="font-semibold text-sm text-primary uppercase tracking-wider mb-1">Étape 3</h4>
//               <h3 className="font-bold text-lg text-foreground">Certifiez et Partagez</h3>
//               <p className="text-muted-foreground text-sm max-w-md mt-1">
//                 Envoyez une demande de recommandation en un clic à vos anciens clients et publiez votre lien.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 5. CTA Final */}
//       <section className="py-16 border-t border-border/40 bg-gradient-to-b from-transparent to-muted/20">
//         <div className="container mx-auto max-w-3xl px-4 text-center space-y-6">
//           <h2 className="text-3xl font-bold tracking-tight">Prêt à décrocher votre prochain contrat ?</h2>
//           <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
//             Rejoignez Flowfolio aujourd'hui et créez un portfolio qui convertit vos visiteurs en opportunités professionnelles.
//           </p>
//           <div className="pt-2">
//             <Link href="/register">
//               <Button size="lg" className="font-semibold gap-2">
//                 Commencer gratuitement <ArrowRight size={16} />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* 6. Footer */}
//       <footer className="mt-auto border-t border-border/40 bg-background py-6">
//         <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
//           <p>© {new Date().getFullYear()} Flowfolio. Tous droits réservés.</p>
//           <div className="flex gap-6">
//             <a href="#" className="hover:text-foreground transition-colors">Mentions légales</a>
//             <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
//             <a href="#" className="hover:text-foreground transition-colors">Contact</a>
//           </div>
//         </div>
//       </footer>

//     </div>
//   )
// }