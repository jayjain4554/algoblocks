import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BookMarked,
  Trash2,
  Pencil,
  LineChart,
  Download,
  ShieldCheck,
  Target,
  Brain,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [backtestData, setBacktestData] = useState({});
  const [loadingId, setLoadingId] = useState(null);

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
      try {
        await axios.delete(`https://algoblocks.onrender.com/strategies/${id}`);
        setStrategies((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const renameStrategy = async (id) => {
    if (!newName.trim()) return alert("Strategy name cannot be empty.");

    try {
      await axios.put(`https://algoblocks.onrender.com/strategies/${id}`, {
        name: newName.trim(),
      });
      setEditingId(null);
      setNewName("");
      fetchStrategies();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const debugStrategyConfig = (config) => {
    console.log("Strategy config:", config);
    
    // Check for required fields
    const requiredFields = ["blocks", "stop_loss", "take_profit"];
    const missingFields = requiredFields.filter(field => config[field] === undefined);
    
    if (missingFields.length > 0) {
      console.warn("Missing required fields:", missingFields);
    }
    
    // Check blocks structure
    if (config.blocks && Array.isArray(config.blocks)) {
      console.log("Blocks count:", config.blocks.length);
      config.blocks.forEach((block, index) => {
        if (!block.label) {
          console.warn(`Block ${index} missing label`);
        }
      });
    } else {
      console.warn("Blocks is not an array or is missing");
    }
  };

  const runBacktest = async (strategy) => {
    try {
      setLoadingId(strategy.id);
      
      // Debug the strategy config
      debugStrategyConfig(strategy.config);
      
      console.log("📤 Sending config to backtest:", strategy.config);

      const res = await axios.post("https://algoblocks.onrender.com/backtest", strategy.config);
      console.log("✅ Backtest raw response:", res.data);

      // Make sure we have the expected data structure
      const responseData = res.data;
      
      // Create default values if data is missing
      const timestamps = responseData.timestamps || [];
      const cumulative_market = responseData.cumulative_market || [];
      const cumulative_strategy = responseData.cumulative_strategy || [];
      const sharpe = responseData.sharpe || 0;
      const total_return = responseData.total_return || 0;
      const max_drawdown = responseData.max_drawdown || 0;

      // Check if we have enough data to render a chart
      if (timestamps.length === 0 || cumulative_strategy.length === 0) {
        console.warn("❌ Missing backtest data. Not updating chart.");
        alert("Backtest returned incomplete data. Please check the strategy config or try again.");
        return;
      }

      // Make sure the arrays have the same length
      const minLength = Math.min(
        timestamps.length,
        cumulative_market.length,
        cumulative_strategy.length
      );
      
      setBacktestData((prev) => ({
        ...prev,
        [strategy.id]: {
          dates: timestamps.slice(0, minLength),
          strategy: cumulative_strategy.slice(0, minLength),
          market: cumulative_market.slice(0, minLength),
          sharpe_ratio: sharpe,
          total_return: total_return,
          max_drawdown: max_drawdown,
        },
      }));
      
      console.log("Chart data prepared successfully");
    } catch (err) {
      console.error("Backtest failed:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        alert(`Backtest error: ${err.response.data.message || "Unknown server error"}`);
      } else {
        alert("An error occurred while running the backtest. Check the console for details.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const exportJSON = (strategy) => {
    const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategy.name || "strategy"}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
        <ul className="space-y-6">
          {strategies.map((s) => {
            const isExpanded = expandedId === s.id;
            const data = backtestData[s.id];

            return (
              <li key={s.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border p-1 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => renameStrategy(s.id)}
                        className="text-green-500 hover:text-green-700 text-xs"
                      >
                        ✅ Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold">{s.name}</h3>
                      <p className="text-sm text-gray-500">
                        {s.config?.blocks?.map((b) => b.label).join(", ")}
                      </p>
                      <button
                        type="button"
                        className="text-blue-500 text-sm underline mt-1"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(s.id);
                        setNewName(s.name);
                      }}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStrategy(s.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-100 mt-4 p-4 rounded">
                    <p className="font-semibold flex items-center gap-1 mb-1">
                      📦 <span>Blocks:</span>
                    </p>
                    <ul className="list-disc ml-6 text-sm mb-3">
                      {s.config?.blocks?.map((b, i) => (
                        <li key={i}>{b.label}</li>
                      ))}
                    </ul>
                    <p className="flex items-center text-sm text-sky-700">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Stop Loss: {(s.config?.stop_loss * 100).toFixed(2)}%
                    </p>
                    <p className="flex items-center text-sm text-pink-700">
                      <Target className="w-4 h-4 mr-1" />
                      Take Profit: {(s.config?.take_profit * 100).toFixed(2)}%
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        type="button"
                        onClick={() => runBacktest(s)}
                        disabled={loadingId === s.id}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1"
                      >
                        <LineChart className="w-4 h-4" />
                        {loadingId === s.id ? "Running..." : "Run Backtest"}
                      </button>
                      <button
                        type="button"
                        onClick={() => exportJSON(s)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" /> Export JSON
                      </button>
                    </div>

                    {data?.dates && data?.strategy && (
                      <div className="mt-6">
                        <Line
                          data={{
                            labels: data.dates,
                            datasets: [
                              {
                                label: "Strategy",
                                data: data.strategy,
                                borderColor: "green",
                                fill: false,
                                tension: 0.1,
                              },
                              {
                                label: "Market",
                                data: data.market || Array(data.strategy.length).fill(0),
                                borderColor: "gray",
                                fill: false,
                                tension: 0.1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                              tooltip: {
                                mode: 'index',
                                intersect: false,
                              },
                            },
                            scales: {
                              x: {
                                ticks: {
                                  maxTicksLimit: 10,
                                  maxRotation: 0,
                                },
                              },
                              y: {
                                ticks: {
                                  callback: function(value) {
                                    return value.toFixed(2);
                                  }
                                }
                              }
                            },
                          }}
                        />

                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                          <p className="flex items-center gap-2 text-purple-700 font-semibold">
                            <Brain className="w-4 h-4" />
                            Performance:
                          </p>
                          <p className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Sharpe Ratio: {isNaN(data.sharpe_ratio) || data.sharpe_ratio === undefined ? "N/A" : data.sharpe_ratio.toFixed(2)}
                          </p>
                          <p className="flex items-center gap-2">
                            💰 Total Return:{" "}
                            {isNaN(data.total_return) || data.total_return === undefined ? "N/A" : data.total_return.toFixed(2) + "%"}
                          </p>
                          <p className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Max Drawdown:{" "}
                            {isNaN(data.max_drawdown) || data.max_drawdown === undefined ? "N/A" : data.max_drawdown.toFixed(2) + "%"}
                          </p>
                        </div>
                      </div>
                    )}
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