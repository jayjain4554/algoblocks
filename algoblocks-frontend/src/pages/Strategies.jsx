import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    axios.get("https://algoblocks.onrender.com/strategies")
      .then(res => setStrategies(res.data))
      .catch(err => console.error("Error fetching strategies", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📚 Saved Strategies</h2>
      <ul className="space-y-4">
        {strategies.map((s, i) => (
          <li key={i} className="p-4 border rounded bg-gray-50">
            <strong>{s.name}</strong>
            <pre className="text-xs mt-2">{JSON.stringify(s.config, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
