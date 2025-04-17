// import React, { useState } from 'react';
// import axios from 'axios';
// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

// export default function Backtest() {
//   const [config, setConfig] = useState({ ticker: 'AAPL', ma_period: 20, use_macd: true, use_bollinger: true });
//   const [result, setResult] = useState(null);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const handleSubmit = async () => {
//     const res = await axios.post('http://localhost:5000/backtest', config);
//     const formatted = res.data.timestamps.map((t, i) => ({
//       date: t,
//       market: res.data.cumulative_market[i],
//       strategy: res.data.cumulative_strategy[i]
//     }));
//     setResult(formatted);
//   };

//   return (
//     <div className="bg-white rounded shadow p-4">
//       <h2 className="text-xl font-semibold mb-2">Backtest Strategy</h2>
//       <input className="border p-2 mb-2 w-full" name="ticker" value={config.ticker} onChange={handleChange} placeholder="Ticker" />
//       <input className="border p-2 mb-2 w-full" type="number" name="ma_period" value={config.ma_period} onChange={handleChange} placeholder="MA Period" />
//       <label className="block mb-1"><input type="checkbox" name="use_macd" checked={config.use_macd} onChange={handleChange} className="mr-2" />Use MACD</label>
//       <label className="block mb-2"><input type="checkbox" name="use_bollinger" checked={config.use_bollinger} onChange={handleChange} className="mr-2" />Use Bollinger Bands</label>
//       <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Run Backtest</button>

//       {result && (
//         <ResponsiveContainer width="100%" height={400} className="mt-4">
//           <LineChart data={result}>
//             <CartesianGrid stroke="#ccc" />
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="market" stroke="#8884d8" name="Market" />
//             <Line type="monotone" dataKey="strategy" stroke="#82ca9d" name="Strategy" />
//           </LineChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }

//new code

import React, { useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Backtest() {
  const [ticker, setTicker] = useState("AAPL");
  const [maPeriod, setMaPeriod] = useState(20);
  const [useMacd, setUseMacd] = useState(true);
  const [useBollinger, setUseBollinger] = useState(true);
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({ sharpe: null, winRate: null, drawdown: null });

  const runBacktest = async () => {
    const res = await axios.post("http://localhost:5000/backtest", {
      ticker, ma_period: maPeriod, use_macd: useMacd, use_bollinger: useBollinger
    });
    const { cumulative_market, cumulative_strategy, timestamps, sharpe, win_rate, drawdown } = res.data;

    const merged = timestamps.map((t, i) => ({
      timestamp: t,
      Market: cumulative_market[i],
      Strategy: cumulative_strategy[i]
    }));

    setData(merged);
    setMetrics({ sharpe, winRate: win_rate, drawdown });
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-lg">
      <h2 className="text-xl font-semibold mb-4">📊 Backtest Strategy</h2>
      <div className="flex gap-4 mb-4 items-end">
        <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Ticker" className="border p-2 rounded" />
        <input type="number" value={maPeriod} onChange={e => setMaPeriod(+e.target.value)} className="border p-2 rounded" />
        <label><input type="checkbox" checked={useMacd} onChange={e => setUseMacd(e.target.checked)} /> MACD</label>
        <label><input type="checkbox" checked={useBollinger} onChange={e => setUseBollinger(e.target.checked)} /> Bollinger</label>
        <button onClick={runBacktest} className="bg-blue-500 text-white px-4 py-2 rounded">Run</button>
      </div>

      {data.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 my-4 text-sm">
            <div>📈 <b>Sharpe Ratio:</b> {metrics.sharpe?.toFixed(2)}</div>
            <div>✅ <b>Win Rate:</b> {(metrics.winRate * 100).toFixed(1)}%</div>
            <div>📉 <b>Max Drawdown:</b> {(metrics.drawdown * 100).toFixed(1)}%</div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Market" stroke="#8884d8" />
              <Line type="monotone" dataKey="Strategy" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
