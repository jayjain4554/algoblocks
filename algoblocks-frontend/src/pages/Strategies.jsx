import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BookMarked,
  Trash2,
  Pencil,
  BarChart2,
  Download,
} from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [backtestResults, setBacktestResults] = useState({});

  const fetchStrategies = async () => {
    const res = await axios.get("https://algoblocks.onrender.com/strategies");
    setStrategies(res.data);
  };

  const deleteStrategy = async (id) => {
    if (window.confirm("Delete this strategy?")) {
      await axios.delete(`https://algoblocks.onrender.com/strategies/${id}`);
      setStrategies((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const renameStrategy = async (id) => {
    try {
      await axios.put(`https://algoblocks.onrender.com/strategies/${id}`, {
        name: newName,
      });
      setEditingId(null);
      setNewName("");
      fetchStrategies();
    } catch (err) {
      console.error("❌ Rename failed:", err);
    }
  };

  const runBacktest = async (strategy) => {
    try {
      const res = await axios.post(
        "https://algoblocks.onrender.com/backtest",
        strategy.config
      );
      setBacktestResults((prev) => ({
        ...prev,
        [strategy.id]: res.data,
      }));
    } catch (err) {
      console.error("❌ Backtest failed:", err);
    }
  };

  const downloadJSON = (strategy) => {
    const blob = new Blob([JSON.stringify(strategy, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${strategy.name || "strategy"}.json`;
    a.click();
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BookMarked className="w-5 h-5 text-purple-600" />
        Saved Strategies
      </h2>

      {strategies.length === 0 ? (
        <p className="text-gray-400 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-6">
          {strategies.map((s) => (
            <li
              key={s.id}
              className="border rounded-lg p-5 shadow-md bg-white space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border p-1 rounded text-sm"
                      />
                      <button
                        onClick={() => renameStrategy(s.id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        ✅ Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">{s.name}</h3>
                      <p className="text-sm text-gray-500">
                        {s.config.blocks.map((b) => b.label).join(", ")}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
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

              {/* Expand / Collapse Section */}
              <button
                className="text-blue-500 text-sm underline"
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                {expandedId === s.id ? "Hide Details" : "Show Details"}
              </button>

              {expandedId === s.id && (
                <div className="bg-slate-100 mt-2 p-4 rounded text-sm">
                  <p><strong>📦 Blocks:</strong></p>
                  <ul className="list-disc ml-5 mb-2">
                    {s.config.blocks.map((b, i) => (
                      <li key={i}>{b.label}</li>
                    ))}
                  </ul>
                  <p>🛡️ Stop Loss: {s.config.stop_loss * 100}%</p>
                  <p>🎯 Take Profit: {s.config.take_profit * 100}%</p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => runBacktest(s)}
                      className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <BarChart2 className="w-4 h-4" />
                      Run Backtest
                    </button>

                    <button
                      onClick={() => downloadJSON(s)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded flex items-center gap-1 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </button>
                  </div>

                  {backtestResults[s.id] && (
                    <div className="mt-4 text-sm">
                      <h4 className="font-semibold text-gray-700 mb-2">📊 Performance:</h4>
                      <ul className="space-y-1">
                        <li>📈 Sharpe Ratio: {backtestResults[s.id].sharpe_ratio?.toFixed(2)}</li>
                        <li>💰 Total Return: {(backtestResults[s.id].returns * 100).toFixed(2)}%</li>
                        <li>📉 Max Drawdown: {(backtestResults[s.id].max_drawdown * 100).toFixed(2)}%</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
