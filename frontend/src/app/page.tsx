'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, MapPin, Navigation, Activity, Zap, CreditCard, Clock, Ruler, Terminal, BookOpen, Route as RouteIcon } from 'lucide-react';
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

  const executeAlgorithm = () => {
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
        
        {/* Theory Section (Moved to the top) */}
        <div className="lg:col-span-12 mb-2 flex items-center gap-3">
           <BookOpen className="text-blue-500" />
           <h2 className="text-xl font-bold tracking-widest uppercase">Algorithmic Theory & Analysis</h2>
        </div>

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
             <h3 className="text-blue-400 font-bold uppercase mb-2 tracking-wider text-sm">Dijkstra's Algorithm</h3>
             <p className="text-sm text-gray-400 mb-4 leading-relaxed">
               Dijkstra's algorithm finds the absolute shortest path from a starting node to a target node in a weighted graph. It uses a priority queue to greedily select the closest unvisited node. It is optimal for routing but cannot handle negative edge weights.
             </p>
             <div className="flex justify-between text-xs font-mono bg-black/40 p-3 rounded-lg text-gray-300">
                <span>Time: O(E log V)</span>
                <span>Space: O(V)</span>
             </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-green-500/20 transition-colors">
             <h3 className="text-green-400 font-bold uppercase mb-2 tracking-wider text-sm">Kruskal's Algorithm</h3>
             <p className="text-sm text-gray-400 mb-4 leading-relaxed">
               Kruskal's algorithm computes the Minimum Spanning Tree (MST) of the network. It sorts all edges in non-decreasing order of weight, then repeatedly adds the smallest edge to the MST provided it doesn't form a cycle, verified using a Disjoint Set structure.
             </p>
             <div className="flex justify-between text-xs font-mono bg-black/40 p-3 rounded-lg text-gray-300">
                <span>Time: O(E log E)</span>
                <span>Space: O(V + E)</span>
             </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-green-500/20 transition-colors">
             <h3 className="text-green-400 font-bold uppercase mb-2 tracking-wider text-sm">Prim's Algorithm</h3>
             <p className="text-sm text-gray-400 mb-4 leading-relaxed">
               Prim's algorithm is another greedy method to construct an MST. Instead of sorting edges, it starts from a single vertex and continually grows the tree by selecting the cheapest edge that connects a visited vertex to an unvisited vertex.
             </p>
             <div className="flex justify-between text-xs font-mono bg-black/40 p-3 rounded-lg text-gray-300">
                <span>Time: O(E log V)</span>
                <span>Space: O(V)</span>
             </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-colors">
             <h3 className="text-orange-400 font-bold uppercase mb-2 tracking-wider text-sm">Bellman-Ford Algorithm</h3>
             <p className="text-sm text-gray-400 mb-4 leading-relaxed">
               Unlike Dijkstra, Bellman-Ford can handle graphs with negative edge weights. It works by repeatedly relaxing all edges V-1 times. If any edge can still be relaxed after V-1 iterations, it detects the presence of a negative weight cycle (used here for arbitrage detection).
             </p>
             <div className="flex justify-between text-xs font-mono bg-black/40 p-3 rounded-lg text-gray-300">
                <span>Time: O(V × E)</span>
                <span>Space: O(V)</span>
             </div>
           </div>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden border border-white/10 relative min-h-[500px] flex flex-col group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md">
            <Activity size={14} className="text-blue-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">Live Telemetry Map</span>
          </div>
          <div className="flex-1 w-full h-full bg-[#0A0F1F] relative">
            <MapComponent edges={activeEdges} />
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* Algorithm Control Center */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-5 flex flex-col border border-white/10 transition-all h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full pointer-events-none" />
             
             <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Navigation size={16} className="text-blue-500" /> Control Center
             </h2>
            
             <div className="space-y-5 mb-6">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-gray-500 ml-2">Select Algorithm</label>
                  <select 
                    value={algorithm} 
                    onChange={(e) => setAlgorithm(e.target.value)} 
                    className="bg-black/60 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none text-white w-full cursor-pointer"
                  >
                    <option value="dijkstra">Dijkstra's Shortest Path</option>
                    <option value="bellman">Bellman-Ford (Arbitrage)</option>
                    <option value="kruskal">Kruskal's MST</option>
                    <option value="prim">Prim's MST</option>
                  </select>
               </div>

               {isRoutingAlgo && (
                 <>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-gray-500 ml-2">Origin</label>
                      <select 
                        value={origin} 
                        onChange={(e) => setOrigin(e.target.value)} 
                        className="bg-black/60 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none text-white w-full cursor-pointer"
                      >
                        {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                      </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-gray-500 ml-2">Destination</label>
                      <select 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        className="bg-black/60 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none text-white w-full cursor-pointer"
                      >
                        {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                      </select>
                   </div>
                 </>
               )}
            </div>

            <button onClick={executeAlgorithm} className="w-full mt-auto bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-3.5 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-[0.98] mb-4">
              Execute Network Compute
            </button>

            {/* Output Console */}
            <div className="bg-[#09090B] rounded-lg p-4 border border-white/5 font-mono text-xs text-gray-400 min-h-[80px] flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2 opacity-50"><Terminal size={12}/> Output Console</div>
              <span className="text-green-400 leading-relaxed">{consoleOutput}</span>
            </div>
          </div>
        </div>
        
        {/* Metrics Panels */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
           <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Network Distance</p>
                 <p className="text-3xl font-bold font-mono">{metrics.distance} <span className="text-sm text-gray-500 font-sans">km</span></p>
                 <p className="text-xs text-gray-500 mt-1">ETA: <span className="text-gray-300">{metrics.time}</span></p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                 <Ruler size={24} className="text-blue-400" />
              </div>
           </div>

           <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center justify-between">
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Base Toll Cost</p>
                 <p className="text-3xl font-bold font-mono text-green-400"><span className="text-xl">₹</span>{metrics.toll.replace('₹','')}</p>
                 <p className="text-xs text-green-500/70 mt-1">Fastag Authorized</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                 <CreditCard size={24} className="text-green-400" />
              </div>
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto border-t border-white/10 pt-6 pb-12 mt-12 text-center text-xs text-gray-500">
         <p>© {new Date().getFullYear()} Expressway Intelligence Platform. Built for Data Structures & Algorithms Analysis.</p>
      </footer>
      
    </div>
  );
}
