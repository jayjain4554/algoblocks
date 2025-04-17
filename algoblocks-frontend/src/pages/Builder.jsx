// import React, { useState } from 'react';
// import Block from '../components/Block';
// import DropZone from '../components/dropzone';

// export default function Builder() {
//   const [blocks, setBlocks] = useState([]);

//   const handleDrop = (block) => {
//     setBlocks((prev) => [...prev, block]);
//   };

//   return (
//     <div className="bg-white rounded shadow p-4">
//       <h2 className="text-xl font-semibold mb-2">Strategy Builder</h2>
//       <div className="flex gap-4">
//         <div className="w-1/3">
//           <Block type="MACD" label="MACD Indicator" />
//           <Block type="BOLLINGER" label="Bollinger Bands" />
//           <Block type="RSI" label="RSI" />
//           <Block type="STOP_LOSS" label="Stop Loss" />
//           <Block type="TAKE_PROFIT" label="Take Profit" />
//         </div>
//         <div className="w-2/3">
//           <DropZone onDrop={handleDrop}>
//             {blocks.map((b, i) => (
//               <div key={i} className="p-2 bg-blue-100 rounded mb-1 text-sm">
//                 {b}
//               </div>
//             ))}
//           </DropZone>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import DropZone from "../components/dropzone";
import Block from "../components/Block";
import axios from "axios";

export default function Builder() {
  const [blocks, setBlocks] = useState([]);
  const [strategyName, setStrategyName] = useState("");
  const [stopLoss, setStopLoss] = useState(2);     // %
  const [takeProfit, setTakeProfit] = useState(5); // %

  const blockOptions = [
    { id: "macd", label: "MACD", type: "indicator" },
    { id: "bollinger", label: "Bollinger", type: "indicator" },
    { id: "rsi", label: "RSI", type: "indicator" },
    { id: "buy", label: "Buy Order", type: "order" },
    { id: "sell", label: "Sell Order", type: "order" }
  ];

  const saveStrategy = async () => {
    await axios.post("http://localhost:5000/strategies", {
      name: strategyName,
      config: { blocks, stop_loss: stopLoss / 100, take_profit: takeProfit / 100 }
    });
    alert("Strategy saved!");
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-lg">
      <h2 className="text-xl font-semibold mb-4">🧱 Strategy Builder</h2>
      <div className="mb-4">
        <input value={strategyName} onChange={e => setStrategyName(e.target.value)} className="border p-2 rounded mr-2" placeholder="Strategy Name" />
        <button onClick={saveStrategy} className="bg-blue-500 text-white px-4 py-2 rounded">💾 Save</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Available Blocks</h3>
          {blockOptions.map(b => (
            <Block key={b.id} block={b} />
          ))}
        </div>

        <DropZone blocks={blocks} setBlocks={setBlocks} />

        <div>
          <h3 className="font-semibold mb-2">⚙️ Risk Settings</h3>
          <label>Stop Loss (%)
            <input type="range" min="0" max="20" value={stopLoss} onChange={e => setStopLoss(+e.target.value)} className="w-full" />
            <div>{stopLoss}%</div>
          </label>
          <label className="mt-4 block">Take Profit (%)
            <input type="range" min="0" max="50" value={takeProfit} onChange={e => setTakeProfit(+e.target.value)} className="w-full" />
            <div>{takeProfit}%</div>
          </label>
        </div>
      </div>
    </div>
  );
}
