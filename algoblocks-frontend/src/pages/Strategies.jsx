import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2, Pencil } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null); // ✅ for show/hide

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
      console.log("🔄 Renaming strategy:", id, newName);
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
            <li
              key={s.id}
              className="border rounded-md p-4 shadow-sm"
            >
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

              {/* ✅ Show/hide strategy details */}
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
