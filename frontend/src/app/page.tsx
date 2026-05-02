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
    <div className="min-h-screen text-white p-4 md:p-8 font-sans relative">
      <div className="glow-edge" />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 max-w-7xl mx-auto glass-panel p-6 rounded-none border-t-2 border-t-[#00f5a0]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <Terminal size={32} className="text-[#00f5a0]" />
          </div>
          <div>
            <h1 className="text-3xl font-mono tracking-tighter text-white">
              // NH-709B <span className="neon-text font-bold">NEXUS</span>
            </h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest mt-1 font-mono">Expressway Data Node</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 glass-panel px-5 py-2.5 rounded-none border border-[#00f5a0]/40">
          <Database size={16} className="text-[#00f5a0]" />
          <div className="w-2.5 h-2.5 bg-[#00f5a0] rounded-full animate-pulse" />
          <span className="text-xs text-[#00f5a0] font-mono tracking-wider font-bold">
            {process.env.NEXT_PUBLIC_BACKEND_URL ? 'BACKEND LINKED' : 'SYS.ONLINE'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Theory Section (Centered Floating Boxes) */}
        <section className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-8 w-full justify-start border-b border-white/10 pb-4">
            <BookOpen className="text-gray-400" size={24} />
            <h2 className="text-xl font-mono tracking-widest text-white uppercase">
              // Algorithmic_Theory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            
            <div className="floating-box-1 glass-panel p-6 rounded-none border-l-4 border-l-blue-500 hover:bg-white/5 transition-all">
              <h3 className="text-blue-400 font-mono uppercase mb-3 tracking-wider text-sm">Dijkstra's Algo</h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                Guarantees the <u className="decoration-blue-500 decoration-2 underline-offset-4">absolute shortest path</u> from a starting node. Uses a priority queue to select the closest unvisited node.
              </p>
              <div className="flex flex-col gap-1 text-[10px] font-mono bg-black/50 p-3 rounded-none text-gray-400 border border-white/5">
                <span className="flex justify-between"><span>TIME</span> <span className="text-white">O(E log V)</span></span>
                <span className="flex justify-between"><span>SPACE</span> <span className="text-white">O(V)</span></span>
              </div>
            </div>

            <div className="floating-box-2 glass-panel p-6 rounded-none border-l-4 border-l-[#00f5a0] hover:bg-white/5 transition-all">
              <h3 className="text-[#00f5a0] font-mono uppercase mb-3 tracking-wider text-sm">Kruskal's Algo</h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                Finds the <u className="decoration-[#00f5a0] decoration-2 underline-offset-4">Minimum Spanning Tree</u>. Sorts edges by weight, adding to MST if no cycles are formed using Disjoint Sets.
              </p>
              <div className="flex flex-col gap-1 text-[10px] font-mono bg-black/50 p-3 rounded-none text-gray-400 border border-white/5">
                <span className="flex justify-between"><span>TIME</span> <span className="text-white">O(E log E)</span></span>
                <span className="flex justify-between"><span>SPACE</span> <span className="text-white">O(V + E)</span></span>
              </div>
            </div>

            <div className="floating-box-3 glass-panel p-6 rounded-none border-l-4 border-l-purple-500 hover:bg-white/5 transition-all">
              <h3 className="text-purple-400 font-mono uppercase mb-3 tracking-wider text-sm">Prim's Algo</h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                Another greedy method for <u className="decoration-purple-500 decoration-2 underline-offset-4">MST generation</u>. Starts from a single vertex and continually grows the tree to unvisited vertices.
              </p>
              <div className="flex flex-col gap-1 text-[10px] font-mono bg-black/50 p-3 rounded-none text-gray-400 border border-white/5">
                <span className="flex justify-between"><span>TIME</span> <span className="text-white">O(E log V)</span></span>
                <span className="flex justify-between"><span>SPACE</span> <span className="text-white">O(V)</span></span>
              </div>
            </div>

            <div className="floating-box-4 glass-panel p-6 rounded-none border-l-4 border-l-rose-500 hover:bg-white/5 transition-all">
              <h3 className="text-rose-400 font-mono uppercase mb-3 tracking-wider text-sm">Bellman-Ford</h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                Can handle negative weights. Repeatedly relaxes edges to <u className="decoration-rose-500 decoration-2 underline-offset-4">detect negative cycles</u>, used for identifying toll arbitrage.
              </p>
              <div className="flex flex-col gap-1 text-[10px] font-mono bg-black/50 p-3 rounded-none text-gray-400 border border-white/5">
                <span className="flex justify-between"><span>TIME</span> <span className="text-white">O(V × E)</span></span>
                <span className="flex justify-between"><span>SPACE</span> <span className="text-white">O(V)</span></span>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Algorithm Control Center */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel p-6 flex flex-col h-full rounded-none">
               
               <h2 className="text-sm font-mono text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <Terminal size={16} className="text-[#00f5a0]" /> root@nexus:~#
               </h2>
              
               <div className="space-y-5 mb-8">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">&gt; Select_Module</label>
                    <select 
                      value={algorithm} 
                      onChange={(e) => setAlgorithm(e.target.value)} 
                      className="bg-black border border-white/20 p-3 text-sm focus:border-[#00f5a0] outline-none text-white w-full cursor-pointer transition-colors font-mono rounded-none"
                    >
                      <option value="dijkstra">Dijkstra [SHORTEST_PATH]</option>
                      <option value="bellman">Bellman-Ford [ARBITRAGE]</option>
                      <option value="kruskal">Kruskal [MIN_SPANNING_TREE]</option>
                      <option value="prim">Prim [MIN_SPANNING_TREE]</option>
                    </select>
                 </div>

                 {isRoutingAlgo && (
                   <div className="bg-black/40 p-4 border border-white/5 space-y-4 rounded-none">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">&gt; Origin_Node</label>
                        <select 
                          value={origin} 
                          onChange={(e) => setOrigin(e.target.value)} 
                          className="bg-black border border-white/20 p-3 text-sm focus:border-[#00f5a0] outline-none text-white w-full cursor-pointer font-mono rounded-none"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">&gt; Target_Node</label>
                        <select 
                          value={destination} 
                          onChange={(e) => setDestination(e.target.value)} 
                          className="bg-black border border-white/20 p-3 text-sm focus:border-[#00f5a0] outline-none text-white w-full cursor-pointer font-mono rounded-none"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                   </div>
                 )}
              </div>

              <button onClick={executeAlgorithm} className="w-full mt-auto bg-[#00f5a0] text-black hover:bg-[#00d188] p-4 font-mono font-bold text-sm transition-all rounded-none mb-6">
                &gt; EXECUTE()
              </button>

              {/* Output Console */}
              <div className="bg-black p-4 border border-white/10 font-mono text-xs text-gray-400 min-h-[90px] flex flex-col justify-end rounded-none">
                <span className="text-[#00f5a0] leading-relaxed">{consoleOutput}</span>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel overflow-hidden border border-white/20 relative h-[500px] flex flex-col rounded-none">
              <div className="absolute top-5 left-5 z-10 bg-black px-4 py-2 flex items-center gap-2 border-l-2 border-l-[#00f5a0]">
                <Activity size={16} className="text-[#00f5a0]" />
                <span className="text-xs font-mono tracking-widest text-white">LIVE_MAP_RENDER</span>
              </div>
              <div className="flex-1 w-full h-full bg-[#050505] relative">
                <MapComponent edges={activeEdges} />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]" />
              </div>
            </div>

            {/* Metrics Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-panel p-6 border-t-2 border-t-[#00f5a0] flex items-center justify-between rounded-none">
                  <div>
                     <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">&gt; Distance</p>
                     <p className="text-4xl font-mono text-white">{metrics.distance} <span className="text-lg text-gray-500">km</span></p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">&gt; ETA</p>
                     <p className="text-xl font-mono text-white">{metrics.time}</p>
                  </div>
               </div>

               <div className="glass-panel p-6 border-t-2 border-t-[#00f5a0] flex items-center justify-between rounded-none">
                  <div>
                     <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">&gt; Toll_Cost</p>
                     <p className="text-4xl font-mono text-[#00f5a0]"><span className="text-2xl mr-1">₹</span>{metrics.toll.replace('₹','')}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">&gt; Tag_Status</p>
                     <p className="text-sm font-mono text-[#00f5a0] flex items-center gap-1 justify-end"><Zap size={14}/> AUTH</p>
                  </div>
               </div>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto pt-8 pb-12 mt-16 border-t border-white/10 text-center text-[10px] text-gray-600 font-mono">
         <p>SYS_VER_1.0.0 // EXPRESSWAY DSA TERMINAL</p>
      </footer>
      
    </div>
  );
}
