// src/pages/Strategies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await axios.get("https://algoblocks.onrender.com/strategies");
        setStrategies(res.data);
      } catch (err) {
        console.error("Error fetching strategies:", err);
      }
    };
    fetchStrategies();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📄 Saved Strategies</h2>
      {strategies.length === 0 ? (
        <p className="text-gray-500 italic">No strategies found.</p>
      ) : (
        <ul className="space-y-4">
          {strategies.map((s) => (
            <li key={s.id} className="border p-4 rounded shadow bg-white">
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <div className="mt-2 text-sm text-gray-700">
                <strong>Blocks:</strong>
                <ul className="list-disc pl-5">
                  {s.config.blocks.map((b, i) => (
                    <li key={i}>{b.label}</li>
                  ))}
                </ul>
                <div className="mt-1">
                  <strong>Stop Loss:</strong> {s.config.stop_loss * 100}%<br />
                  <strong>Take Profit:</strong> {s.config.take_profit * 100}%
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
