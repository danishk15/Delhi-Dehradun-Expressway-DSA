'use client';

import { Layers, Activity, Zap, Route as RouteIcon, GitMerge, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen premium-bg text-white p-4 md:p-8 font-sans flex flex-col items-center">
      
      {/* Hero Header */}
      <header className="w-full max-w-4xl mx-auto mt-10 mb-20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-4">
          <Layers size={40} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Delhi-Dehradun <br/> <span className="premium-gradient-text">Expressway Nexus</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl font-medium leading-relaxed">
          A high-performance algorithmic simulation platform for analyzing infrastructure networks using advanced Data Structures & Algorithms.
        </p>
      </header>

      <main className="w-full max-w-3xl mx-auto flex flex-col gap-10 mb-20">
        
        <div className="flex items-center justify-center gap-3 mb-4">
           <BookOpen className="text-indigo-400" size={28} />
           <h2 className="text-2xl font-bold tracking-widest text-white uppercase">
             Algorithmic Foundations
           </h2>
        </div>

        {/* Theory Section - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
            
            <div className="floating-card-1 glass-panel p-8 rounded-3xl hover:bg-white/[0.03] transition-all group flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                 <RouteIcon size={28} className="text-blue-400" />
              </div>
              <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl text-white font-bold mb-2 tracking-wide">Dijkstra's Algorithm</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Used to calculate the absolute shortest path between the Origin and Destination hubs. It utilizes a Priority Queue to greedily select the closest unvisited node, ensuring the optimal route based on distance, time, or cost.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-300 justify-center">
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Time Complexity: <span className="text-blue-400 ml-1">O(E log V)</span></span>
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Space Complexity: <span className="text-blue-400 ml-1">O(V)</span></span>
                  </div>
              </div>
            </div>

            <div className="floating-card-2 glass-panel p-8 rounded-3xl hover:bg-white/[0.03] transition-all group flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <Activity size={28} className="text-emerald-400" />
              </div>
              <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl text-white font-bold mb-2 tracking-wide">Kruskal's Algorithm</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Generates the Minimum Spanning Tree (MST) of the expressway network. It sorts all highway edges by weight and iteratively adds them to the network, avoiding cycles through a Disjoint Set data structure.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-300 justify-center">
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Time Complexity: <span className="text-emerald-400 ml-1">O(E log E)</span></span>
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Space Complexity: <span className="text-emerald-400 ml-1">O(V + E)</span></span>
                  </div>
              </div>
            </div>

            <div className="floating-card-3 glass-panel p-8 rounded-3xl hover:bg-white/[0.03] transition-all group flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                 <GitMerge size={28} className="text-purple-400" />
              </div>
              <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl text-white font-bold mb-2 tracking-wide">Prim's Algorithm</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    An alternative approach to constructing the Minimum Spanning Tree. It begins at an arbitrary hub and continually expands the connected network by attaching the cheapest edge to an unvisited destination.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-300 justify-center">
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Time Complexity: <span className="text-purple-400 ml-1">O(E log V)</span></span>
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Space Complexity: <span className="text-purple-400 ml-1">O(V)</span></span>
                  </div>
              </div>
            </div>

            <div className="floating-card-4 glass-panel p-8 rounded-3xl hover:bg-white/[0.03] transition-all group flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(243,64,121,0.2)]">
                 <Zap size={28} className="text-rose-400" />
              </div>
              <div className="flex flex-col items-center w-full">
                  <h3 className="text-xl text-white font-bold mb-2 tracking-wide">Bellman-Ford Algorithm</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Capable of processing networks with negative edge weights. In this simulation, it relaxes all edges sequentially to detect negative toll cycles, highlighting potential arbitrage vulnerabilities in the system.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-300 justify-center">
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Time Complexity: <span className="text-rose-400 ml-1">O(V × E)</span></span>
                    <span className="bg-black/30 px-4 py-2.5 rounded-xl border border-white/5">Space Complexity: <span className="text-rose-400 ml-1">O(V)</span></span>
                  </div>
              </div>
            </div>

        </div>

      </main>

      {/* Call to Action - Go to Simulator */}
      <div className="w-full flex justify-center pb-20">
         <Link href="/simulator" className="group relative inline-flex items-center justify-center gap-3 bg-white text-black font-bold text-lg px-10 py-5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:bg-gray-100 transition-all active:scale-95">
           Open Interactive Simulator <ArrowRight className="group-hover:translate-x-1 transition-transform" />
         </Link>
      </div>

      <footer className="w-full max-w-7xl mx-auto pt-10 pb-12 border-t border-white/5 text-center text-xs text-gray-600">
         <p>Delhi-Dehradun Expressway Simulator • Advanced DSA Final Project</p>
      </footer>
      
    </div>
  );
}
