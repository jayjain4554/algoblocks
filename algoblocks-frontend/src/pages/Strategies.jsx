import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    axios.get("https://algoblocks.onrender.com/strategies").then((res) => {
      setStrategies(res.data.reverse()); // Show latest first
    });
  }, []);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-purple-500" />
        Saved Strategies
      </h2>

      {strategies.length === 0 ? (
        <p className="italic text-gray-400">No strategies found.</p>
      ) : (
        <ul className="space-y-4">
          {strategies.map((strategy, index) => (
            <li
              key={strategy.id}
              className="bg-white rounded shadow px-6 py-4 border border-gray-200"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOpen(index)}
              >
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>

              {openIndex === index && (
                <div className="mt-4 text-sm text-gray-700">
                  <p className="mb-2">
                    <strong>Stop Loss:</strong> {(strategy.config?.stop_loss ?? 0) * 100}%
                  </p>
                  <p className="mb-2">
                    <strong>Take Profit:</strong> {(strategy.config?.take_profit ?? 0) * 100}%
                  </p>
                  <p className="font-semibold mt-3 mb-1">🧱 Blocks:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {(strategy.config?.blocks ?? []).map((b, i) => (
                      <li key={i}>{b.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
