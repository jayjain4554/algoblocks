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
      setLoadingId(strategy.id);
      const res = await axios.post("https://algoblocks.onrender.com/backtest", strategy.config);
      const { cumulative_market, cumulative_strategy, timestamps, sharpe, total_return, max_drawdown } = res.data;

      setBacktestData((prev) => ({
        ...prev,
        [strategy.id]: {
          dates: timestamps,
          strategy: cumulative_strategy,
          market: cumulative_market,
          sharpe_ratio: sharpe,
          total_return: total_return,
          max_drawdown: max_drawdown,
        },
      }));

      setLoadingId(null);
    } catch (err) {
      console.error("Backtest failed", err);
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
                        className="text-blue-500 text-sm underline mt-1"
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  )}

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

                {isExpanded && (
                  <div className="bg-slate-100 mt-4 p-4 rounded">
                    <p className="font-semibold flex items-center gap-1 mb-1">
                      📦 <span>Blocks:</span>
                    </p>
                    <ul className="list-disc ml-6 text-sm mb-3">
                      {s.config.blocks.map((b, i) => (
                        <li key={i}>{b.label}</li>
                      ))}
                    </ul>
                    <p className="flex items-center text-sm text-sky-700">
                      <ShieldCheck className="w-4 h-4 mr-1" /> Stop Loss: {s.config.stop_loss * 100}%
                    </p>
                    <p className="flex items-center text-sm text-pink-700">
                      <Target className="w-4 h-4 mr-1" /> Take Profit: {s.config.take_profit * 100}%
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => runBacktest(s)}
                        disabled={loadingId === s.id}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1"
                      >
                        <LineChart className="w-4 h-4" />
                        {loadingId === s.id ? "Running..." : "Run Backtest"}
                      </button>
                      <button
                        onClick={() => exportJSON(s)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" /> Export JSON
                      </button>
                    </div>

                    {data && data.dates && data.strategy && data.market && (
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
                              },
                              {
                                label: "Market",
                                data: data.market,
                                borderColor: "gray",
                                fill: false,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: "top",
                              },
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
                            Sharpe Ratio:{" "}
                            {isNaN(data.sharpe_ratio) ? "N/A" : data.sharpe_ratio}
                          </p>
                          <p className="flex items-center gap-2">
                            💰 Total Return:{" "}
                            {isNaN(data.total_return) ? "N/A" : data.total_return + "%"}
                          </p>
                          <p className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Max Drawdown:{" "}
                            {isNaN(data.max_drawdown) ? "N/A" : data.max_drawdown + "%"}
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
