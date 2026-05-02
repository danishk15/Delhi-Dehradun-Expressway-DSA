'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Activity, Zap, CreditCard, Clock, Ruler, Terminal, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CITIES } from '@/data';
import { runDijkstra, runKruskal, runPrim, runBellmanFord, Edge } from '@/utils/algorithms';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

export default function SimulatorPage() {
  const [origin, setOrigin] = useState('Delhi Hub');
  const [destination, setDestination] = useState('Dehradun Terminus');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  
  const [activeEdges, setActiveEdges] = useState<[number, number][][]>([]);
  const [metrics, setMetrics] = useState({ distance: '--', time: '--', toll: '--' });
  const [consoleOutput, setConsoleOutput] = useState('Simulator initialized. Select an algorithm and configure parameters.');

  const convertEdgesToCoords = (edges: Edge[]): [number, number][][] => {
    return edges.map(e => [
      [CITIES[e.u].lat, CITIES[e.u].lng],
      [CITIES[e.v].lat, CITIES[e.v].lng]
    ]);
  };

  const executeAlgorithm = async () => {
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
      setConsoleOutput(`Dijkstra optimal route found. Time, Distance, and Toll calculated.`);
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
        time: 'N/A (MST)',
        toll: 'N/A (MST)'
      });
      setConsoleOutput(`${algorithm === 'kruskal' ? 'Kruskal' : 'Prim'} MST computation complete. Network fully connected.`);
    }
  };

  const isRoutingAlgo = algorithm === 'dijkstra' || algorithm === 'bellman';

  return (
    <div className="min-h-screen premium-bg text-white p-4 md:p-8 font-sans">
      
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/" className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors">
           <ArrowLeft size={16} /> Back to Theory
        </Link>
        <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-indigo-500/30">
          <Activity size={16} className="text-indigo-400" />
          <span className="text-xs text-gray-300 tracking-widest font-semibold uppercase">
            Execution Environment Active
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Interactive Map (Highlighted & Large) */}
        <section className="w-full">
            <div className="glass-panel rounded-[2.5rem] p-4 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <div className="rounded-[2rem] overflow-hidden relative h-[600px] flex flex-col">
                <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-xl px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl">
                    <MapPin size={20} className="text-indigo-400 animate-pulse" />
                    <span className="text-sm font-bold tracking-widest uppercase text-white shadow-sm">Route Visualizer</span>
                </div>
                <div className="flex-1 w-full h-full relative">
                    <MapComponent edges={activeEdges} />
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
                </div>
              </div>
            </div>
        </section>

        {/* Configuration and Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Control Center */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-8 flex flex-col h-full relative border border-white/10 shadow-2xl">
               
               <h2 className="text-xl font-bold text-white tracking-wide mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                <Navigation size={24} className="text-indigo-400" /> Simulator Config
               </h2>
              
               <div className="space-y-6 mb-8 flex-1">
                 <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Algorithm Engine</label>
                    <div className="relative">
                      <select 
                        value={algorithm} 
                        onChange={(e) => setAlgorithm(e.target.value)} 
                        className="appearance-none bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors"
                      >
                        <option value="dijkstra">Dijkstra (Shortest Path)</option>
                        <option value="bellman">Bellman-Ford (Arbitrage Detection)</option>
                        <option value="kruskal">Kruskal (MST Topology)</option>
                        <option value="prim">Prim (MST Topology)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight size={16} className="text-gray-500 transform rotate-90" />
                      </div>
                    </div>
                 </div>

                 {isRoutingAlgo && (
                   <div className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 space-y-5">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Origin</label>
                        <select 
                          value={origin} 
                          onChange={(e) => setOrigin(e.target.value)} 
                          className="appearance-none bg-black/40 border border-white/10 rounded-2xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors"
                        >
                          {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Destination</label>
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

              <button onClick={executeAlgorithm} className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl p-4 font-bold text-sm transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] active:scale-[0.98] mb-6 flex justify-center items-center gap-2">
                Calculate Metrics <ArrowRight size={16} />
              </button>

              {/* Status Display */}
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold"><Terminal size={14}/> Console Output</div>
                <span className="leading-relaxed text-gray-300">{consoleOutput}</span>
              </div>
            </div>
          </div>

          {/* Metrics Results */}
          <div className="lg:col-span-7 flex flex-col gap-6 justify-center">
            <h3 className="text-xl font-bold tracking-wide text-white mb-2 ml-2 flex items-center gap-3">
               <Activity className="text-emerald-400" /> Computed Telemetry
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 border-l-4 border-l-blue-500 shadow-xl hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3 text-blue-400">
                        <Ruler size={24} />
                        <span className="uppercase tracking-widest text-sm font-bold text-gray-400">Total Distance</span>
                    </div>
                    <div className="text-5xl font-black text-white">{metrics.distance} <span className="text-xl text-gray-500 font-medium">km</span></div>
                </div>

                <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 border-l-4 border-l-indigo-500 shadow-xl hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Clock size={24} />
                        <span className="uppercase tracking-widest text-sm font-bold text-gray-400">Est. Time</span>
                    </div>
                    <div className="text-4xl font-black text-white mt-1">{metrics.time}</div>
                </div>

                <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 sm:col-span-2 border-l-4 border-l-emerald-500 shadow-xl hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3 text-emerald-400">
                        <CreditCard size={24} />
                        <span className="uppercase tracking-widest text-sm font-bold text-gray-400">Toll Expense</span>
                    </div>
                    <div className="text-5xl font-black text-white"><span className="text-3xl text-gray-500 mr-2">₹</span>{metrics.toll.replace('₹','')}</div>
                </div>
            </div>
          </div>

        </section>
      </main>
      
    </div>
  );
}
