// src/pages/Strategies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStrategies = async () => {
    try {
      const res = await axios.get("https://algoblocks.onrender.com/strategies");
      setStrategies(res.data);
    } catch (err) {
      console.error("Error fetching strategies:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStrategy = async (id) => {
    try {
      await axios.delete(`https://algoblocks.onrender.com/strategies/${id}`);
      setStrategies((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📄 Saved Strategies
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : strategies.length === 0 ? (
        <p className="text-gray-400 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-4">
          {strategies.map((s) => (
            <li
              key={s.id}
              className="p-4 bg-white border rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <pre className="text-xs mt-1 text-gray-500">
                  {JSON.stringify(s.config, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => deleteStrategy(s.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
