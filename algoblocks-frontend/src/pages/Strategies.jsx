import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2, Pencil, BarChart4, Download, ShieldCheck, Target, TrendingUp, LineChart } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Legend } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend);

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [results, setResults] = useState({}); // key = strategy.id, value = {strategy, market, sharpe, drawdown, return}

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

  const runBacktest = async (config, id) => {
    try {
      const res = await axios.post("https://algoblocks.onrender.com/backtest", config);
      setResults((prev) => ({
        ...prev,
        [id]: res.data,
      }));
    } catch (err) {
      console.error("❌ Backtest error:", err);
    }
  };

  const exportJSON = (strategy) => {
    const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategy.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BookMarked className="w-5 h-5 text-purple-600" />
        Saved Strategies
      </h2>

      {strategies.length === 0 ? (
        <p className="text-gray-400 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-6">
          {strategies.map((s) => (
            <li key={s.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2 mb-1">
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
                      <h3 className="text-lg font-bold">{s.name}</h3>
                      <p className="text-sm text-gray-500">{s.config.blocks.map((b) => b.label).join(", ")}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setEditingId(s.id); setNewName(s.name); }} className="text-yellow-500 hover:text-yellow-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteStrategy(s.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggle section */}
              <div className="mt-2">
                <button
                  className="text-blue-500 text-sm underline"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                >
                  {expandedId === s.id ? "Hide Details" : "Show Details"}
                </button>

                {expandedId === s.id && (
                  <div className="bg-slate-100 mt-2 p-4 rounded">
                    <p className="font-semibold flex items-center gap-1"><BarChart4 className="w-4 h-4" /> Blocks:</p>
                    <ul className="list-disc ml-6 mb-2 text-sm">
                      {s.config.blocks.map((b, i) => <li key={i}>{b.label}</li>)}
                    </ul>

                    <p className="text-sm flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-600" /> Stop Loss: {s.config.stop_loss * 100}%</p>
                    <p className="text-sm flex items-center gap-1"><Target className="w-4 h-4 text-red-500" /> Take Profit: {s.config.take_profit * 100}%</p>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => runBacktest(s.config, s.id)} className="bg-blue-600 text-white text-sm px-4 py-1 rounded shadow hover:bg-blue-700">
                        📊 Run Backtest
                      </button>
                      <button onClick={() => exportJSON(s)} className="bg-gray-200 text-sm px-4 py-1 rounded hover:bg-gray-300 flex items-center gap-1">
                        <Download className="w-4 h-4" /> Export JSON
                      </button>
                    </div>

                    {/* Results */}
                    {results[s.id] && (
                      <div className="mt-6">
                        <p className="font-semibold flex items-center gap-1 text-purple-700"><TrendingUp className="w-4 h-4" /> Performance:</p>
                        <ul className="text-sm ml-4 mt-1">
                          <li>📈 Sharpe Ratio: {results[s.id].sharpe_ratio?.toFixed(2) || "N/A"}</li>
                          <li>💰 Total Return: {(results[s.id].total_return * 100).toFixed(2) || "0"}%</li>
                          <li>📉 Max Drawdown: {(results[s.id].max_drawdown * 100).toFixed(2) || "0"}%</li>
                        </ul>

                        {/* Chart */}
                        <div className="mt-4">
                          <Line
                            data={{
                              labels: results[s.id].strategy_values.map((_, i) => `Day ${i + 1}`),
                              datasets: [
                                {
                                  label: "Strategy",
                                  data: results[s.id].strategy_values,
                                  borderColor: "green",
                                  tension: 0.3,
                                  fill: false
                                },
                                {
                                  label: "Market",
                                  data: results[s.id].market_values,
                                  borderColor: "gray",
                                  tension: 0.3,
                                  fill: false
                                }
                              ]
                            }}
                            options={{ responsive: true, plugins: { legend: { display: true } } }}
                            height={150}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
