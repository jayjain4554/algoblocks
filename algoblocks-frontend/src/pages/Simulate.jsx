import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Simulate() {
  const [config, setConfig] = useState({ ticker: 'AAPL', ma_period: 20, use_macd: true, use_bollinger: true });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    const res = await axios.post('http://localhost:5000/simulate', config);
    const formatted = res.data.timestamps.map((t, i) => ({
      time: t,
      portfolio: res.data.portfolio_value[i]
    }));
    setResult(formatted);
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-2">Simulate Real-Time Strategy</h2>
      <input className="border p-2 mb-2 w-full" name="ticker" value={config.ticker} onChange={handleChange} placeholder="Ticker" />
      <input className="border p-2 mb-2 w-full" type="number" name="ma_period" value={config.ma_period} onChange={handleChange} placeholder="MA Period" />
      <label className="block mb-1"><input type="checkbox" name="use_macd" checked={config.use_macd} onChange={handleChange} className="mr-2" />Use MACD</label>
      <label className="block mb-2"><input type="checkbox" name="use_bollinger" checked={config.use_bollinger} onChange={handleChange} className="mr-2" />Use Bollinger Bands</label>
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Run Simulation</button>

      {result && (
        <ResponsiveContainer width="100%" height={400} className="mt-4">
          <LineChart data={result}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="portfolio" stroke="#f97316" name="Portfolio Value" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
