import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});
import { Layers, MapPin, Navigation, Activity, Zap, CreditCard, Clock, Ruler, Terminal, GitMerge, Search, Route } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505]">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-animated flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              DELHI-DEHRADUN <span className="text-blue-500">NEXUS</span>
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Smart Expressway Simulation</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-green-500/30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-mono tracking-wider">SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Grid Dashboard */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Visualization (Large Center Area) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden border border-white/10 relative min-h-[500px] flex flex-col group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md">
            <Activity size={14} className="text-blue-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">Live Telemetry Map</span>
          </div>
          <div className="flex-1 w-full h-full bg-[#0A0F1F] relative">
            <MapComponent />
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* Algorithm Cards (Right Sidebar Stack) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Algorithm 1: Shortest Path (Dijkstra) */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col border border-white/10 hover:border-blue-500/50 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full pointer-events-none" />
             <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Navigation size={16} className="text-blue-500" /> Shortest Path (Dijkstra)
            </h2>
            
            <div className="space-y-4 mb-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-500 ml-2">Origin</label>
                  <select className="bg-black/60 border border-white/10 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white w-full">
                    <option>Delhi Hub</option>
                    <option>Baghpat Checkpoint</option>
                  </select>
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-500 ml-2">Destination</label>
                  <select className="bg-black/60 border border-white/10 rounded-lg p-2.5 text-sm focus:border-purple-500 outline-none text-white w-full">
                    <option>Dehradun Terminus</option>
                    <option>Saharanpur Grid</option>
                  </select>
               </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-3 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-[0.98] mb-4">
              Compute Route
            </button>

            {/* Output Console */}
            <div className="bg-[#09090B] rounded-lg p-3 border border-white/5 font-mono text-xs text-gray-400 mt-auto min-h-[60px] flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Terminal size={12}/> Output Console</div>
              <span className="text-green-400">&gt; Waiting for execution...</span>
            </div>
          </div>

          {/* Algorithm 2: Minimum Spanning Tree (Kruskal's / Prim's) */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col border border-white/10 hover:border-green-500/50 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 blur-[50px] rounded-full pointer-events-none" />
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <GitMerge size={16} className="text-green-500" /> Optimize Network
                </h2>
                <select className="bg-transparent border-none text-xs text-green-400 font-mono outline-none cursor-pointer">
                  <option value="kruskal">Kruskal's Alg</option>
                  <option value="prim">Prim's Alg</option>
                </select>
             </div>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Calculates the Minimum Spanning Tree (MST) to connect all hubs with the absolute minimum toll/distance overhead.
            </p>

            <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg p-3 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-[0.98] mb-4">
              Generate MST
            </button>

            {/* Output Console */}
            <div className="bg-[#09090B] rounded-lg p-3 border border-white/5 font-mono text-xs text-gray-400 mt-auto min-h-[60px] flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1 opacity-50"><Terminal size={12}/> Output Console</div>
              <span className="text-green-400">&gt; Network untouched.</span>
            </div>
          </div>

        </div>
        
        {/* Bottom Metrics / Third Algorithm */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Algorithm 3: Bellman-Ford (Arbitrage) */}
           <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all group">
             <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Route size={16} className="text-orange-500" /> Fuel Arbitrage (Bellman-Ford)
             </h2>
             <p className="text-xs text-gray-400 mb-4">Detect negative cycles for potential fuel/toll arbitrage loops across the highway network.</p>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full border border-white/10 hover:border-orange-500/50">
               Scan for Arbitrage
             </button>
           </div>

           {/* Metrics Panels */}
           <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Network Distance</p>
                 <p className="text-3xl font-bold font-mono">192 <span className="text-sm text-gray-500 font-sans">km</span></p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                 <Ruler size={20} className="text-blue-400" />
              </div>
           </div>

           <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Base Toll Cost</p>
                 <p className="text-3xl font-bold font-mono text-green-400"><span className="text-xl">₹</span>240</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                 <CreditCard size={20} className="text-green-400" />
              </div>
           </div>

        </div>
      </main>

      {/* Footer / Credits */}
      <footer className="max-w-7xl mx-auto mt-12 mb-4 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
         <p>© {new Date().getFullYear()} Expressway Intelligence Platform.</p>
         <div className="flex items-center gap-2 mt-4 md:mt-0">
           <span>Developed by</span>
           <span className="font-semibold text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
             Danish – Project Lead & Developer
           </span>
         </div>
      </footer>
      
    </div>
  );
}
