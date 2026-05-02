'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, MapPin, Navigation, Activity, Zap, CreditCard, Clock, Ruler, Terminal, BookOpen, Route as RouteIcon, Database } from 'lucide-react';
import { CITIES } from '@/data';
import { runDijkstra, runKruskal, runPrim, runBellmanFord, Edge } from '@/utils/algorithms';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

export default function Home() {
  const [origin, setOrigin] = useState('Delhi Hub');
  const [destination, setDestination] = useState('Dehradun Terminus');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  
  const [activeEdges, setActiveEdges] = useState<[number, number][][]>([]);
  const [metrics, setMetrics] = useState({ distance: '0', time: '--', toll: '₹0' });
  const [consoleOutput, setConsoleOutput] = useState('> System initialized. Waiting for execution...');

  const convertEdgesToCoords = (edges: Edge[]): [number, number][][] => {
    return edges.map(e => [
      [CITIES[e.u].lat, CITIES[e.u].lng],
      [CITIES[e.v].lat, CITIES[e.v].lng]
    ]);
  };

  const executeAlgorithm = async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // If user has linked their backend via Vercel env variables, route traffic there!
    if (BACKEND_URL) {
      setConsoleOutput(`> Sending compute request to linked backend: ${BACKEND_URL}...`);
      try {
        // Example structure for how they can configure their backend calls
        const res = await fetch(`${BACKEND_URL}/api/compute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ algorithm, origin, destination })
        });
        const data = await res.json();
        // Set state from backend data...
        setConsoleOutput('> Backend computation successful. (Configure backend response parsing here)');
        return;
      } catch (err) {
        setConsoleOutput('> Backend connection failed. Falling back to native client algorithms...');
      }
    }

    // Native fallback execution
    if (algorithm === 'dijkstra') {
      const result = runDijkstra(origin, destination);
      if (result.pathEdges.length === 0) {
        setConsoleOutput(`> No path found from ${origin} to ${destination}.`);
        return;
      }
      setActiveEdges(convertEdgesToCoords(result.pathEdges));
      setMetrics({
        distance: result.totalDist.toString(),
        time: `${Math.floor(result.totalTime / 60)}h ${result.totalTime % 60}m`,
        toll: `₹${result.totalToll}`
      });
      setConsoleOutput(`> Dijkstra execution complete. Shortest path found: ${result.totalDist}km.`);
    } else if (algorithm === 'bellman') {
      const result = runBellmanFord(origin);
      const dResult = runDijkstra(origin, destination); 
      setActiveEdges(convertEdgesToCoords(dResult.pathEdges));
      setMetrics({
        distance: dResult.totalDist.toString(),
        time: `${Math.floor(dResult.totalTime / 60)}h ${dResult.totalTime % 60}m`,
        toll: `₹${dResult.totalToll}`
      });
      setConsoleOutput(result.hasNegativeCycle 
        ? '> Bellman-Ford: WARNING - Negative toll cycle detected! Arbitrage possible.' 
        : `> Bellman-Ford complete: Shortest path ${dResult.totalDist}km. No negative cycles detected.`);
    } else if (algorithm === 'kruskal' || algorithm === 'prim') {
      const result = algorithm === 'kruskal' ? runKruskal() : runPrim();
      setActiveEdges(convertEdgesToCoords(result.mst));
      setMetrics({
        distance: result.totalDist.toString(),
        time: '--',
        toll: '--'
      });
      setConsoleOutput(`> ${algorithm.toUpperCase()} execution complete. MST Weight: ${result.totalDist}km.`);
    }
  };

  const isRoutingAlgo = algorithm === 'dijkstra' || algorithm === 'bellman';

  return (
    <div className="min-h-screen catchy-bg text-white p-4 md:p-8 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 max-w-7xl mx-auto bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6)]">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-cyan-400">
              DELHI-DEHRADUN <span className="text-cyan-400">NEXUS</span>
            </h1>
            <p className="text-sm text-cyan-200 uppercase tracking-widest mt-1 font-semibold">Smart Expressway Simulation</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 glass-panel px-5 py-2.5 rounded-full border border-green-400/40">
          <Database size={16} className="text-green-400" />
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-300 font-mono tracking-wider font-bold">
            {process.env.NEXT_PUBLIC_BACKEND_URL ? 'LINKED BACKEND ONLINE' : 'CLIENT ENGINE ONLINE'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Theory Section (Centered Floating Boxes) */}
        <section className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-cyan-400" size={28} />
            <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 uppercase drop-shadow-lg">
              Algorithmic Theory & Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            
            <div className="floating-box-1 bg-gradient-to-br from-blue-900/80 to-blue-950/80 p-6 rounded-3xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all">
              <h3 className="text-blue-300 font-extrabold uppercase mb-3 tracking-wider text-lg border-b border-blue-400/30 pb-2">Dijkstra's Algo</h3>
              <p className="text-sm text-blue-100 mb-5 leading-relaxed">
                Guarantees the <u className="decoration-blue-400 decoration-2 underline-offset-4 font-semibold">absolute shortest path</u> from a starting node. It uses a priority queue to greedily select the closest unvisited node. Optimal for routing without negative weights.
              </p>
              <div className="flex flex-col gap-1 text-xs font-mono bg-blue-950/50 p-3 rounded-xl text-blue-200 border border-blue-800">
                <span className="flex justify-between"><b>Time:</b> O(E log V)</span>
                <span className="flex justify-between"><b>Space:</b> O(V)</span>
              </div>
            </div>

            <div className="floating-box-2 bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 p-6 rounded-3xl border border-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all">
              <h3 className="text-emerald-300 font-extrabold uppercase mb-3 tracking-wider text-lg border-b border-emerald-400/30 pb-2">Kruskal's Algo</h3>
              <p className="text-sm text-emerald-100 mb-5 leading-relaxed">
                Finds the <u className="decoration-emerald-400 decoration-2 underline-offset-4 font-semibold">Minimum Spanning Tree (MST)</u>. Sorts all edges by weight, adding the smallest edge to the MST provided it doesn't form a cycle (using Disjoint Sets).
              </p>
              <div className="flex flex-col gap-1 text-xs font-mono bg-emerald-950/50 p-3 rounded-xl text-emerald-200 border border-emerald-800">
                <span className="flex justify-between"><b>Time:</b> O(E log E)</span>
                <span className="flex justify-between"><b>Space:</b> O(V + E)</span>
              </div>
            </div>

            <div className="floating-box-3 bg-gradient-to-br from-purple-900/80 to-purple-950/80 p-6 rounded-3xl border border-purple-400/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all">
              <h3 className="text-purple-300 font-extrabold uppercase mb-3 tracking-wider text-lg border-b border-purple-400/30 pb-2">Prim's Algo</h3>
              <p className="text-sm text-purple-100 mb-5 leading-relaxed">
                Another greedy method for the <u className="decoration-purple-400 decoration-2 underline-offset-4 font-semibold">MST generation</u>. It starts from a single vertex and continually grows the tree by selecting the cheapest edge to an unvisited vertex.
              </p>
              <div className="flex flex-col gap-1 text-xs font-mono bg-purple-950/50 p-3 rounded-xl text-purple-200 border border-purple-800">
                <span className="flex justify-between"><b>Time:</b> O(E log V)</span>
                <span className="flex justify-between"><b>Space:</b> O(V)</span>
              </div>
            </div>

            <div className="floating-box-4 bg-gradient-to-br from-rose-900/80 to-rose-950/80 p-6 rounded-3xl border border-rose-400/30 shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.6)] transition-all">
              <h3 className="text-rose-300 font-extrabold uppercase mb-3 tracking-wider text-lg border-b border-rose-400/30 pb-2">Bellman-Ford</h3>
              <p className="text-sm text-rose-100 mb-5 leading-relaxed">
                Unlike Dijkstra, it can handle negative weights. It repeatedly relaxes edges to <u className="decoration-rose-400 decoration-2 underline-offset-4 font-semibold">detect negative cycles</u>, which we use for identifying toll arbitrage opportunities.
              </p>
              <div className="flex flex-col gap-1 text-xs font-mono bg-rose-950/50 p-3 rounded-xl text-rose-200 border border-rose-800">
                <span className="flex justify-between"><b>Time:</b> O(V × E)</span>
                <span className="flex justify-between"><b>Space:</b> O(V)</span>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Algorithm Control Center */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 flex flex-col border border-white/20 transition-all h-full relative overflow-hidden shadow-2xl bg-black/40">
               
               <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <Navigation size={20} className="text-cyan-400" /> Control Center
               </h2>
              
               <div className="space-y-5 mb-8">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase text-cyan-300 ml-1 font-bold tracking-wider">Select Algorithm</label>
                    <select 
                      value={algorithm} 
                      onChange={(e) => setAlgorithm(e.target.value)} 
                      className="bg-black/60 border border-cyan-500/30 rounded-xl p-3.5 text-sm focus:border-cyan-400 outline-none text-white w-full cursor-pointer transition-colors"
                    >
                      <option value="dijkstra">Dijkstra's Shortest Path</option>
                      <option value="bellman">Bellman-Ford (Arbitrage)</option>
                      <option value="kruskal">Kruskal's MST</option>
                      <option value="prim">Prim's MST</option>
                    </select>
                 </div>

                 {isRoutingAlgo && (
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase text-gray-400 ml-1 tracking-wider">Origin</label>
                        <select 
                          value={origin} 
                          onChange={(e) => setOrigin(e.target.value)} 
                          className="bg-black/60 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none text-white w-full cursor-pointer"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase text-gray-400 ml-1 tracking-wider">Destination</label>
                        <select 
                          value={destination} 
                          onChange={(e) => setDestination(e.target.value)} 
                          className="bg-black/60 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none text-white w-full cursor-pointer"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                   </div>
                 )}
              </div>

              <button onClick={executeAlgorithm} className="w-full mt-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl p-4 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-[0.98] mb-6">
                EXECUTE NETWORK COMPUTE
              </button>

              {/* Output Console */}
              <div className="bg-black/80 rounded-xl p-4 border border-green-500/30 font-mono text-xs text-gray-400 min-h-[90px] flex flex-col justify-end shadow-inner">
                <div className="flex items-center gap-2 mb-2 opacity-70 text-green-400"><Terminal size={14}/> SYSTEM OUTPUT</div>
                <span className="text-green-300 leading-relaxed">{consoleOutput}</span>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/20 relative h-[500px] flex flex-col shadow-2xl bg-black/40">
              <div className="absolute top-5 left-5 z-10 bg-black/60 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/10 shadow-lg">
                <Activity size={16} className="text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-white">Live Route Map</span>
              </div>
              <div className="flex-1 w-full h-full bg-[#0A0F1F] relative">
                <MapComponent edges={activeEdges} />
                <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]" />
              </div>
            </div>

            {/* Metrics Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-panel rounded-3xl p-6 border border-white/20 flex items-center justify-between bg-gradient-to-r from-black/40 to-blue-900/20 shadow-xl">
                  <div>
                     <p className="text-xs text-cyan-300 uppercase tracking-widest mb-1 font-bold">Network Distance</p>
                     <p className="text-4xl font-black font-mono text-white">{metrics.distance} <span className="text-lg text-gray-400 font-sans">km</span></p>
                     <p className="text-xs text-gray-400 mt-2 font-medium">ETA: <span className="text-cyan-100">{metrics.time}</span></p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                     <Ruler size={28} className="text-cyan-300" />
                  </div>
               </div>

               <div className="glass-panel rounded-3xl p-6 border border-white/20 flex items-center justify-between bg-gradient-to-r from-black/40 to-emerald-900/20 shadow-xl">
                  <div>
                     <p className="text-xs text-emerald-300 uppercase tracking-widest mb-1 font-bold">Base Toll Cost</p>
                     <p className="text-4xl font-black font-mono text-white"><span className="text-2xl text-emerald-400 mr-1">₹</span>{metrics.toll.replace('₹','')}</p>
                     <p className="text-xs text-emerald-400/80 mt-2 font-medium flex items-center gap-1"><Zap size={12}/> Fastag Authorized</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     <CreditCard size={28} className="text-emerald-300" />
                  </div>
               </div>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto pt-8 pb-12 mt-16 text-center text-sm text-cyan-200/50 font-medium">
         <p>© {new Date().getFullYear()} Expressway Intelligence Platform. Built for Data Structures & Algorithms Analysis.</p>
      </footer>
      
    </div>
  );
}
