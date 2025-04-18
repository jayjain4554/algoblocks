import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2, Pencil, BarChart2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
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
      console.error("Rename failed:", err);
    }
  };

  const runBacktest = async (id, config) => {
    try {
      const res = await axios.post("https://algoblocks.onrender.com/backtest", config);
      setBacktestResults((prev) => ({
        ...prev,
        [id]: res.data,
      }));
      setExpandedId(id);
    } catch (err) {
      console.error("Backtest error:", err);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookMarked className="w-5 h-5 text-purple-600" />
        Saved Strategies
      </h2>

      {strategies.length === 0 ? (
        <p className="text-gray-400 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-4">
          {strategies.map((s) => {
            const result = backtestResults[s.id];
            const show = expandedId === s.id;
            return (
              <li key={s.id} className="border rounded-md p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    {editingId === s.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="border p-1 rounded text-sm"
                        />
                        <button
                          onClick={() => renameStrategy(s.id)}
                          className="text-green-500 hover:text-green-700 text-xs"
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
                      onClick={() => runBacktest(s.id, s.config)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
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

                {show && result && (
                  <div className="mt-4 bg-slate-100 rounded p-4">
                    <p className="text-sm mb-1">📊 Strategy Performance</p>
                    <Line
                      data={{
                        labels: result.timestamps,
                        datasets: [
                          {
                            label: "Market",
                            data: result.cumulative_market,
                            borderColor: "gray",
                            tension: 0.3,
                          },
                          {
                            label: "Strategy",
                            data: result.cumulative_strategy,
                            borderColor: "blue",
                            tension: 0.3,
                          },
                        ],
                      }}
                      height={100}
                    />
                    <div className="mt-4 space-y-1 text-sm">
                      <p>📈 Sharpe Ratio: <strong>{isNaN(result.sharpe) ? "N/A" : result.sharpe.toFixed(2)}</strong></p>
                      <p>💰 Total Return: <strong>{result.cumulative_strategy ? ((result.cumulative_strategy.slice(-1)[0] - 1) * 100).toFixed(2) + "%" : "N/A"}</strong></p>
                      <p>📉 Max Drawdown: <strong>N/A (Coming Soon)</strong></p>
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
