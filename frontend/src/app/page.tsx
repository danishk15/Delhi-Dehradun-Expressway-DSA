'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, MapPin, Navigation, Activity, Zap, CreditCard, Clock, Ruler, Terminal, BookOpen, Route as RouteIcon, Database, ArrowRight, GitMerge } from 'lucide-react';
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
  const [consoleOutput, setConsoleOutput] = useState('System initialized and ready for computation.');

  const convertEdgesToCoords = (edges: Edge[]): [number, number][][] => {
    return edges.map(e => [
      [CITIES[e.u].lat, CITIES[e.u].lng],
      [CITIES[e.v].lat, CITIES[e.v].lng]
    ]);
  };

  const executeAlgorithm = async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (BACKEND_URL) {
      setConsoleOutput(`Sending compute request to linked backend...`);
      try {
        const res = await fetch(`${BACKEND_URL}/api/compute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ algorithm, origin, destination })
        });
        const data = await res.json();
        setConsoleOutput('Backend computation successful.');
        return;
      } catch (err) {
        setConsoleOutput('Backend connection failed. Falling back to native client algorithms...');
      }
    }

    // Native execution
    if (algorithm === 'dijkstra') {
      const result = runDijkstra(origin, destination);
      if (result.pathEdges.length === 0) {
        setConsoleOutput(`No path found from ${origin} to ${destination}.`);
        return;
      }
      setActiveEdges(convertEdgesToCoords(result.pathEdges));
      setMetrics({
        distance: result.totalDist.toString(),
        time: `${Math.floor(result.totalTime / 60)}h ${result.totalTime % 60}m`,
        toll: `₹${result.totalToll}`
      });
      setConsoleOutput(`Dijkstra optimal route found. Total distance: ${result.totalDist}km.`);
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
        ? 'WARNING: Negative toll cycle detected! Arbitrage possible.' 
        : `Bellman-Ford complete. Shortest path: ${dResult.totalDist}km. No negative cycles detected.`);
    } else if (algorithm === 'kruskal' || algorithm === 'prim') {
      const result = algorithm === 'kruskal' ? runKruskal() : runPrim();
      setActiveEdges(convertEdgesToCoords(result.mst));
      setMetrics({
        distance: result.totalDist.toString(),
        time: '--',
        toll: '--'
      });
      setConsoleOutput(`${algorithm === 'kruskal' ? 'Kruskal' : 'Prim'} MST computation complete. Total network weight: ${result.totalDist}km.`);
    }
  };

  const isRoutingAlgo = algorithm === 'dijkstra' || algorithm === 'bellman';

  return (
    <div className="min-h-screen premium-bg text-white p-4 md:p-8 font-sans">
      
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 max-w-7xl mx-auto glass-panel p-6 md:px-10 md:py-6 rounded-full border border-white/5">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Delhi-Dehradun <span className="premium-gradient-text">Nexus</span>
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5 font-medium">Data Structures Simulation Platform</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
          <Database size={16} className="text-indigo-400" />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300 tracking-widest font-semibold uppercase">
            {process.env.NEXT_PUBLIC_BACKEND_URL ? 'Linked Server Online' : 'Client Engine Active'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Theory Section */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold tracking-wide text-white">
              Algorithms Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="floating-card-1 glass-panel p-6 rounded-3xl hover:bg-white/[0.03] transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <RouteIcon size={18} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Dijkstra's Algorithm</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Computes the absolute shortest path. It utilizes a priority queue to greedily select the closest unvisited node.
              </p>
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500">
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Time Complexity <span className="text-gray-300">O(E log V)</span></span>
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Space Complexity <span className="text-gray-300">O(V)</span></span>
              </div>
            </div>

            <div className="floating-card-2 glass-panel p-6 rounded-3xl hover:bg-white/[0.03] transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                 <Activity size={18} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Kruskal's Algorithm</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Finds the Minimum Spanning Tree (MST). Sorts edges by weight, adding to the network avoiding cycles via Disjoint Sets.
              </p>
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500">
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Time Complexity <span className="text-gray-300">O(E log E)</span></span>
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Space Complexity <span className="text-gray-300">O(V + E)</span></span>
              </div>
            </div>

            <div className="floating-card-3 glass-panel p-6 rounded-3xl hover:bg-white/[0.03] transition-all group">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:scale-110 transition-transform">
                 <GitMerge size={18} className="text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Prim's Algorithm</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                An alternative MST generator. Starts from a single vertex and continually grows the network to unvisited vertices.
              </p>
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500">
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Time Complexity <span className="text-gray-300">O(E log V)</span></span>
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Space Complexity <span className="text-gray-300">O(V)</span></span>
              </div>
            </div>

            <div className="floating-card-4 glass-panel p-6 rounded-3xl hover:bg-white/[0.03] transition-all group">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20 group-hover:scale-110 transition-transform">
                 <Zap size={18} className="text-rose-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Bellman-Ford</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Handles graphs with negative weights. Used to scan the network to identify negative toll arbitrage cycles.
              </p>
              <div className="flex flex-col gap-2 text-xs font-medium text-gray-500">
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Time Complexity <span className="text-gray-300">O(V × E)</span></span>
                <span className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">Space Complexity <span className="text-gray-300">O(V)</span></span>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Map Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl overflow-hidden relative h-[500px] flex flex-col shadow-2xl">
              <div className="absolute top-5 left-5 z-10 bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/10 shadow-xl">
                <MapPin size={16} className="text-indigo-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-white">Interactive Map</span>
              </div>
              <div className="flex-1 w-full h-full relative">
                <MapComponent edges={activeEdges} />
                <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Distance & ETA</p>
                     <p className="text-3xl font-bold text-white mb-1">{metrics.distance} <span className="text-base text-gray-500 font-normal">km</span></p>
                     <p className="text-sm text-indigo-300 font-medium">{metrics.time}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                     <Clock size={24} className="text-indigo-400" />
                  </div>
               </div>

               <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Toll Estimate</p>
                     <p className="text-3xl font-bold text-white mb-1"><span className="text-xl text-gray-500 mr-1">₹</span>{metrics.toll.replace('₹','')}</p>
                     <p className="text-sm text-emerald-400 font-medium">Fastag Active</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <CreditCard size={24} className="text-emerald-400" />
                  </div>
               </div>
            </div>
          </div>

          {/* Control Center */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 flex flex-col h-full relative">
               
               <h2 className="text-lg font-bold text-white tracking-wide mb-6 flex items-center gap-3">
                <Navigation size={20} className="text-indigo-400" /> Configuration
               </h2>
              
               <div className="space-y-6 mb-8 flex-1">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 font-medium ml-1">Algorithm Selection</label>
                    <div className="relative">
                      <select 
                        value={algorithm} 
                        onChange={(e) => setAlgorithm(e.target.value)} 
                        className="appearance-none bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors"
                      >
                        <option value="dijkstra">Dijkstra's Shortest Path</option>
                        <option value="bellman">Bellman-Ford (Arbitrage)</option>
                        <option value="kruskal">Kruskal's MST</option>
                        <option value="prim">Prim's MST</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight size={16} className="text-gray-500 transform rotate-90" />
                      </div>
                    </div>
                 </div>

                 {isRoutingAlgo && (
                   <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 space-y-5">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-medium ml-1">Origin Hub</label>
                        <select 
                          value={origin} 
                          onChange={(e) => setOrigin(e.target.value)} 
                          className="appearance-none bg-black/40 border border-white/10 rounded-2xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-medium ml-1">Destination Hub</label>
                        <select 
                          value={destination} 
                          onChange={(e) => setDestination(e.target.value)} 
                          className="appearance-none bg-black/40 border border-white/10 rounded-2xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                   </div>
                 )}
              </div>

              <button onClick={executeAlgorithm} className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl p-4 font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] mb-6 flex justify-center items-center gap-2">
                Execute Compute <ArrowRight size={16} />
              </button>

              {/* Status Display */}
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold"><Terminal size={14}/> System Status</div>
                <span className="leading-relaxed text-gray-300">{consoleOutput}</span>
              </div>
            </div>
          </div>

        </section>

      </main>

      <footer className="max-w-7xl mx-auto pt-10 pb-12 mt-12 border-t border-white/5 text-center text-xs text-gray-500">
         <p>Delhi-Dehradun Expressway Simulator • Built for Performance & Analysis</p>
      </footer>
      
    </div>
  );
}
