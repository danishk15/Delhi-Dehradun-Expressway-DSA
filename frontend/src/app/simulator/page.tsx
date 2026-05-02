'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Activity, ArrowRight, ArrowLeft, Clock, Ruler, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { CITIES } from '@/data';
import { runDijkstra, runKruskal, runPrim, runBellmanFord, Edge } from '@/utils/algorithms';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

type CalcMode = 'distance' | 'time' | 'cost' | null;

export default function SimulatorPage() {
  const [calcMode, setCalcMode] = useState<CalcMode>(null);
  const [origin, setOrigin] = useState('Delhi Hub');
  const [destination, setDestination] = useState('Dehradun Terminus');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  
  const [activeEdges, setActiveEdges] = useState<[number, number][][]>([]);
  const [resultVal, setResultVal] = useState<string | null>(null);

  const convertEdgesToCoords = (edges: Edge[]): [number, number][][] => {
    return edges.map(e => [
      [CITIES[e.u].lat, CITIES[e.u].lng],
      [CITIES[e.v].lat, CITIES[e.v].lng]
    ]);
  };

  const executeAlgorithm = async () => {
    if (algorithm === 'dijkstra') {
      const result = runDijkstra(origin, destination);
      setActiveEdges(convertEdgesToCoords(result.pathEdges));
      
      if (calcMode === 'distance') setResultVal(`${result.totalDist} km`);
      if (calcMode === 'time') setResultVal(`${Math.floor(result.totalTime / 60)}h ${result.totalTime % 60}m`);
      if (calcMode === 'cost') setResultVal(`₹${result.totalToll}`);
      
    } else if (algorithm === 'bellman') {
      const result = runBellmanFord(origin);
      const dResult = runDijkstra(origin, destination); 
      setActiveEdges(convertEdgesToCoords(dResult.pathEdges));

      if (result.hasNegativeCycle) {
        setResultVal("ERROR: Negative cycle detected.");
      } else {
        if (calcMode === 'distance') setResultVal(`${dResult.totalDist} km`);
        if (calcMode === 'time') setResultVal(`${Math.floor(dResult.totalTime / 60)}h ${dResult.totalTime % 60}m`);
        if (calcMode === 'cost') setResultVal(`₹${dResult.totalToll}`);
      }
    } else if (algorithm === 'kruskal' || algorithm === 'prim') {
      const result = algorithm === 'kruskal' ? runKruskal() : runPrim();
      setActiveEdges(convertEdgesToCoords(result.mst));
      setResultVal(`Network Weight: ${result.totalDist} km`);
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
            Execution Environment
          </span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Compact Configuration Box */}
        <div className="flex-1 lg:max-w-md flex flex-col gap-6">
          <div className="glass-panel rounded-[2rem] p-8 flex flex-col border border-white/10 shadow-2xl">
             <h2 className="text-2xl font-bold text-white tracking-wide mb-8 flex items-center gap-3">
              <Navigation size={28} className="text-indigo-400" /> Configurator
             </h2>

             {/* Step 1: Mode Selection */}
             {!calcMode && (
               <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-gray-400 font-medium mb-2">What would you like to calculate?</p>
                  <button onClick={() => setCalcMode('distance')} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors text-left group">
                     <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Ruler size={20} className="text-blue-400"/></div>
                     <div>
                        <div className="font-bold text-white text-lg">Calculate Distance</div>
                        <div className="text-xs text-gray-400">Find the shortest path length</div>
                     </div>
                  </button>
                  <button onClick={() => setCalcMode('time')} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors text-left group">
                     <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={20} className="text-indigo-400"/></div>
                     <div>
                        <div className="font-bold text-white text-lg">Calculate Time</div>
                        <div className="text-xs text-gray-400">Estimate travel duration</div>
                     </div>
                  </button>
                  <button onClick={() => setCalcMode('cost')} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors text-left group">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform"><CreditCard size={20} className="text-emerald-400"/></div>
                     <div>
                        <div className="font-bold text-white text-lg">Calculate Cost</div>
                        <div className="text-xs text-gray-400">Estimate Fastag toll expenses</div>
                     </div>
                  </button>
               </div>
             )}

             {/* Step 2: Form */}
             {calcMode && (
                <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300">
                   <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                         Mode: {calcMode}
                      </span>
                      <button onClick={() => { setCalcMode(null); setResultVal(null); setActiveEdges([]); }} className="text-xs text-gray-400 hover:text-white underline underline-offset-4">Change</button>
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Select Algorithm</label>
                      <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="appearance-none bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors">
                        <option value="dijkstra">Dijkstra's Algorithm</option>
                        <option value="bellman">Bellman-Ford Algorithm</option>
                        <option value="kruskal">Kruskal's Algorithm (MST)</option>
                        <option value="prim">Prim's Algorithm (MST)</option>
                      </select>
                   </div>

                   {isRoutingAlgo && (
                     <div className="flex flex-col gap-4 mt-2">
                       <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Origin City</label>
                          <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="appearance-none bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors">
                            {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                          </select>
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-400 font-medium ml-1 uppercase tracking-wider">Destination City</label>
                          <select value={destination} onChange={(e) => setDestination(e.target.value)} className="appearance-none bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm focus:border-indigo-500 outline-none text-white w-full cursor-pointer transition-colors">
                            {Object.keys(CITIES).map(key => <option key={key} value={key}>{key}</option>)}
                          </select>
                       </div>
                     </div>
                   )}

                   <button onClick={executeAlgorithm} className="w-full mt-4 bg-white text-black hover:bg-gray-200 rounded-xl p-4 font-bold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                     Execute Calculation <ArrowRight size={16} />
                   </button>
                </div>
             )}

             {/* Results */}
             {resultVal && (
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in duration-500">
                   <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Final {calcMode} Output</span>
                   <span className={`text-4xl font-black ${calcMode === 'cost' ? 'text-emerald-400' : calcMode === 'time' ? 'text-indigo-400' : 'text-blue-400'}`}>
                      {resultVal}
                   </span>
                </div>
             )}

          </div>
        </div>

        {/* Right Side: Interactive Map (Highlighted) */}
        <div className="flex-[2] flex flex-col">
          <div className="glass-panel rounded-[2.5rem] p-4 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] h-full min-h-[600px]">
            <div className="rounded-[2rem] overflow-hidden relative h-full flex flex-col">
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
        </div>

      </main>
      
    </div>
  );
}
