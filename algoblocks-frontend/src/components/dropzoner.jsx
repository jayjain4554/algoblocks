// frontend/src/components/dropzoner.jsx

import React from "react";
import { useDrop } from "react-dnd";

export default function Dropzoner({ blocks, setBlocks }) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "block",
    drop: (item) => {
      setBlocks((prev) => [...prev, item]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`min-h-[200px] border-2 rounded-md p-4 transition-all ${
        isOver ? "border-green-400 bg-green-50" : "border-dashed border-gray-400"
      }`}
    >
      <h3 className="text-sm font-semibold mb-2">📥 Drop Blocks Here</h3>
      {blocks.length === 0 ? (
        <p className="text-gray-400 italic">No blocks added yet.</p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((block, i) => (
            <li key={i} className="p-2 border rounded bg-gray-50">{block.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
