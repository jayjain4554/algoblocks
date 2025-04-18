// import React from "react";
// import Builder from "./pages/Builder";
// import Backtest from "./pages/Backtest";
// import Simulate from "./pages/Simulate";

// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";

// export default function App() {
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="p-4">
//         <h1 className="text-3xl font-bold mb-4">AlgoBlocks</h1>
//         <div className="grid gap-4">
//           <Backtest />
//           <Simulate />
//           <Builder />
//         </div>
//       </div>
//     </DndProvider>
//   );
// }

// import React, { useState } from 'react';
// import Builder from './pages/Builder';
// import Backtest from './pages/Backtest';
// import Simulate from './pages/Simulate';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { BarChart, Cpu, Activity } from 'lucide-react';

// export default function App() {
//   const [page, setPage] = useState('backtest');

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-50 p-6 font-sans">
//         <header className="mb-6 text-center">
//           <h1 className="text-4xl font-bold text-sky-800">AlgoBlocks</h1>
//           <p className="text-gray-500">Build, test and simulate algorithmic strategies with ease</p>
//         </header>

//         <nav className="flex justify-center gap-4 mb-8 text-sm font-medium text-slate-600">
//           <button
//             onClick={() => setPage('backtest')}
//             className={`flex items-center gap-1 px-4 py-2 rounded-md ${
//               page === 'backtest' ? 'bg-sky-100 text-sky-700 font-semibold' : 'hover:bg-slate-100'
//             }`}
//           >
//             <BarChart className="w-4 h-4" /> Backtest
//           </button>
//           <button
//             onClick={() => setPage('simulate')}
//             className={`flex items-center gap-1 px-4 py-2 rounded-md ${
//               page === 'simulate' ? 'bg-sky-100 text-sky-700 font-semibold' : 'hover:bg-slate-100'
//             }`}
//           >
//             <Activity className="w-4 h-4" /> Simulate
//           </button>
//           <button
//             onClick={() => setPage('builder')}
//             className={`flex items-center gap-1 px-4 py-2 rounded-md ${
//               page === 'builder' ? 'bg-sky-100 text-sky-700 font-semibold' : 'hover:bg-slate-100'
//             }`}
//           >
//             <Cpu className="w-4 h-4" /> Strategy Builder
//           </button>
//         </nav>

//         <main className="max-w-5xl mx-auto">
//           {page === 'backtest' && <Backtest />}
//           {page === 'simulate' && <Simulate />}
//           {page === 'builder' && <Builder />}
//         </main>
//       </div>
//     </DndProvider>
//   );
// }


import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Builder from './pages/Builder';
import Backtest from './pages/Backtest';
import Simulate from './pages/Simulate';
import Strategies from './pages/Strategies'; // ✅ Make sure this path is correct
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Cpu, BarChart, Activity, BookOpen } from 'lucide-react'; // ✅ Import new icon

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-50 p-6 font-sans">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-sky-800">AlgoBlocks</h1>
          <p className="text-gray-500">Build, test, and simulate algorithmic strategies</p>
        </header>

        <nav className="flex justify-center gap-4 mb-8 text-sm font-medium text-slate-600">
          <Link to="/" className="flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100">
            <BarChart className="w-4 h-4" /> Backtest
          </Link>
          <Link to="/simulate" className="flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100">
            <Activity className="w-4 h-4" /> Simulate
          </Link>
          <Link to="/builder" className="flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100">
            <Cpu className="w-4 h-4" /> Strategy Builder
          </Link>
          <Link to="/strategies" className="flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100">
            📚 Saved Strategies
          </Link>
        </nav>

        <main className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Backtest />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/strategies" element={<Strategies />} />
          </Routes>
        </main>
      </div>
    </DndProvider>
  );
}
