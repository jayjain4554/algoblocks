import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2, Pencil, LineChart } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [chartData, setChartData] = useState({}); // holds chart data for strategy

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
      const payload = {
        ticker: "AAPL", // you can enhance this later
        ma_period: 20,
        use_macd: config.blocks.some(b => b.id === "macd"),
        use_bollinger: config.blocks.some(b => b.id === "bollinger")
      };
      const res = await axios.post("https://algoblocks.onrender.com/backtest", payload);
      setChartData(prev => ({
        ...prev,
        [id]: {
          labels: res.data.timestamps,
          datasets: [
            {
              label: "Strategy",
              data: res.data.cumulative_strategy,
              borderColor: "green",
              fill: false,
            },
            {
              label: "Market",
              data: res.data.cumulative_market,
              borderColor: "gray",
              fill: false,
            }
          ]
        }
      }));
    } catch (err) {
        console.error("❌ Backtest failed:", err);
        alert("Backtest failed");
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
          {strategies.map((s) => (
            <li key={s.id} className="border rounded-md p-4 shadow-sm">
              <div className="flex justify-between items-center">
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
                    <div>
                      <h3 className="text-lg font-semibold">{s.name}</h3>
                      <p className="text-sm text-gray-500">
                        {s.config.blocks.map((b) => b.label).join(", ")}
                      </p>
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
                  </>
                )}
              </div>

              <div className="mt-2">
                <button
                  className="text-blue-500 text-sm underline"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                >
                  {expandedId === s.id ? "Hide Details" : "Show Details"}
                </button>

                {expandedId === s.id && (
                  <div className="bg-slate-100 mt-2 p-3 rounded text-sm">
                    <p><strong>📦 Blocks:</strong></p>
                    <ul className="list-disc ml-5 mb-2">
                      {s.config.blocks.map((b, i) => (
                        <li key={i}>{b.label}</li>
                      ))}
                    </ul>
                    <p>🛡️ Stop Loss: {s.config.stop_loss * 100}%</p>
                    <p>🎯 Take Profit: {s.config.take_profit * 100}%</p>

                    <button
                      onClick={() => runBacktest(s.config, s.id)}
                      className="mt-4 text-sm bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2"
                    >
                      <LineChart className="w-4 h-4" /> Run Backtest
                    </button>

                    {chartData[s.id] && (
                      <div className="mt-4">
                        <Line data={chartData[s.id]} options={{ responsive: true }} />
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
