import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookMarked, Trash2 } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);

  const fetchStrategies = async () => {
    const res = await axios.get("https://algoblocks.onrender.com/strategies");
    setStrategies(res.data);
  };

  const deleteStrategy = async (id) => {
    if (window.confirm("Are you sure you want to delete this strategy?")) {
      await axios.delete(`https://algoblocks.onrender.com/strategies/${id}`);
      setStrategies((prev) => prev.filter((s) => s.id !== id));
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
          {strategies.map((strategy) => (
            <li
              key={strategy.id}
              className="border rounded-md p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
                <p className="text-sm text-gray-500">
                  {strategy.config.blocks.map((b) => b.label).join(", ")}
                </p>
              </div>
              <button
                onClick={() => deleteStrategy(strategy.id)}
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
