// import React from 'react';
// import { useDrag } from 'react-dnd';

// export default function Block({ type, label }) {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: 'BLOCK',
//     item: { type },
//     collect: (monitor) => ({ isDragging: monitor.isDragging() })
//   }));

//   return (
//     <div
//       ref={drag}
//       className={`p-2 m-1 bg-white rounded border shadow text-sm cursor-move ${
//         isDragging ? 'opacity-50' : ''
//       }`}
//     >
//       {label}
//     </div>
//   );
// }

import React from "react";
import { useDrag } from "react-dnd";

export default function Block({ block }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "block",
    item: block,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef}
      className={`cursor-move p-2 border rounded bg-white hover:bg-sky-50 shadow-sm mb-2 ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      {block.label}
    </div>
  );
}

