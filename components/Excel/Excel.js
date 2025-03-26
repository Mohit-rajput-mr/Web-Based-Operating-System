// Excel.js (simple blank version, ignoring any file prop)

import React, { useState } from 'react';
import './Excel.css';

export default function Excel() {
  // Initialize a 10x6 blank grid
  const [grid, setGrid] = useState(() => {
    const rows = 10;
    const cols = 6;
    const initial = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push('');
      }
      initial.push(row);
    }
    return initial;
  });

  // Basic cell editing
  const handleCellChange = (r, c, value) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = value;
    setGrid(newGrid);
  };

  // Evaluate cell if it starts with '='
  const getCellValue = (r, c) => {
    const raw = grid[r][c];
    if (typeof raw !== 'string') return raw;
    if (!raw.startsWith('=')) return raw;

    try {
      const expr = raw.slice(1).replace(/[A-Z]+[0-9]+/g, ref => {
        // E.g. "A1" => row=0,col=0
        const colLetters = ref.match(/[A-Z]+/)[0];
        const rowDigits = ref.match(/[0-9]+/)[0];
        const rr = parseInt(rowDigits, 10) - 1;
        const cc = colLetters.charCodeAt(0) - 65;
        let val = grid[rr]?.[cc] || 0;
        // Avoid recursion for now
        if (typeof val === 'string' && val.startsWith('=')) val = 0;
        return val;
      });
      // eslint-disable-next-line no-eval
      return eval(expr) || 0;
    } catch (err) {
      return '#ERR';
    }
  };

  const handleSave = () => {
    // Stub for saving
    alert('Spreadsheet saved (stub)!');
  };

  return (
    <div className="excel-container">
      <div className="excel-toolbar">
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="excel-grid">
        <table>
          <thead>
            <tr>
              <th></th>
              {grid[0].map((_, colIndex) => (
                <th key={colIndex}>{String.fromCharCode(65 + colIndex)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td className="row-header">{r + 1}</td>
                {row.map((cell, c) => (
                  <td key={c}>
                    <input
                      value={cell}
                      onChange={(e) => handleCellChange(r, c, e.target.value)}
                    />
                    <div className="cell-value">{getCellValue(r, c)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
