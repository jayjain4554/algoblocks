import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2, Pencil, BarChart3, Download, Shield, Target, FlaskConical, TrendingUp, TrendingDown } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [backtestResults, setBacktestResults] = useState({});

  const fetchStrategies = async () => {
    try {
      const res = await axios.get("https://algoblocks.onrender.com/strategies");
      setStrategies(res.data);
    } catch (err) {
      console.error("Failed to fetch strategies:", err);
    }
  };

  const deleteStrategy = async (id) => {
    if (window.confirm("Delete this strategy?")) {
      await axios.delete(`https://algoblocks.onrender.com/strategies/${id}`);
      setStrategies((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const renameStrategy = async (id) => {
    try {
      await axios.put(`https://algoblocks.onrender.com/strategies/${id}`, { name: newName });
      setEditingId(null);
      setNewName("");
      fetchStrategies();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const runBacktest = async (strategy) => {
    try {
      const res = await axios.post("https://algoblocks.onrender.com/backtest", strategy.config);
      setBacktestResults((prev) => ({ ...prev, [strategy.id]: res.data }));
    } catch (err) {
      console.error("Backtest failed:", err);
    }
  };

  const exportJSON = (strategy) => {
    const dataStr = JSON.stringify(strategy, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${strategy.name || "strategy"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookMarked className="text-purple-600" />
        Saved Strategies
      </h2>

      {strategies.length === 0 ? (
        <p className="text-gray-400 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-6">
          {strategies.map((s) => {
            const result = backtestResults[s.id] || {};
            const { sharpe_ratio, total_return, max_drawdown } = result;

            return (
              <li key={s.id} className="border rounded-md p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border p-1 rounded text-sm"
                      />
                      <button
                        onClick={() => renameStrategy(s.id)}
                        className="text-green-600 text-xs hover:underline"
                      >
                        ✅ Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold">{s.name}</h3>
                      <p className="text-sm text-gray-500">
                        {s.config?.blocks?.map((b) => b.label).join(", ") || "No blocks"}
                      </p>
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="text-blue-500 text-xs mt-1 hover:underline"
                      >
                        {expandedId === s.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => {
                        setEditingId(s.id);
                        setNewName(s.name);
                      }}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStrategy(s.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedId === s.id && (
                  <div className="bg-slate-100 mt-4 p-4 rounded text-sm">
                    <p className="font-semibold flex items-center gap-1">
                      📦 Blocks:
                    </p>
                    <ul className="list-disc ml-6 mb-3">
                      {s.config?.blocks?.map((b, i) => (
                        <li key={i}>{b.label}</li>
                      ))}
                    </ul>

                    <p className="flex gap-2 items-center">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Stop Loss: {Math.round(s.config?.stop_loss * 100)}%
                    </p>
                    <p className="flex gap-2 items-center">
                      <Target className="w-4 h-4 text-red-500" />
                      Take Profit: {Math.round(s.config?.take_profit * 100)}%
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2 text-sm"
                        onClick={() => runBacktest(s)}
                      >
                        <BarChart3 className="w-4 h-4" /> Run Backtest
                      </button>
                      <button
                        className="bg-gray-200 px-3 py-1 rounded flex items-center gap-2 text-sm"
                        onClick={() => exportJSON(s)}
                      >
                        <Download className="w-4 h-4" /> Export JSON
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold flex items-center gap-1 text-purple-600">
                        <FlaskConical className="w-4 h-4" />
                        Performance:
                      </p>
                      <p className="flex gap-2 items-center">
                        <TrendingUp className="w-4 h-4 text-pink-500" />
                        Sharpe Ratio: {isNaN(sharpe_ratio) ? "N/A" : sharpe_ratio.toFixed(2)}
                      </p>
                      <p className="flex gap-2 items-center">
                        💰 Total Return: {isNaN(total_return) ? "N/A" : `${(total_return * 100).toFixed(2)}%`}
                      </p>
                      <p className="flex gap-2 items-center">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        Max Drawdown: {isNaN(max_drawdown) ? "N/A" : `${(max_drawdown * 100).toFixed(2)}%`}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
