/**
 * CsvTable — filterable CSV table React component.
 *
 * @decision DEC-008
 * @title CSV table shortcode ported to React component
 * @status accepted
 * @rationale The Hugo layouts/shortcodes/table.html is currently orphaned (no
 *            content pages use it), but we preserve its functionality as a React
 *            component for future use. The React version is cleaner than the
 *            Hugo template: it uses Papa Parse for robust CSV parsing, React
 *            state for filtering, and standard HTML table elements.
 *
 * Usage in MDX:
 *   import CsvTable from '@site/src/components/CsvTable';
 *   <CsvTable src="/table.csv" />
 *
 * Props:
 *   src  {string}  Path to CSV file relative to /static/ (e.g. "/table.csv")
 */

import React, { useState, useEffect } from 'react';

/**
 * Minimal CSV parser — handles quoted fields and embedded commas.
 * For production use, replace with Papa Parse if the CSV grows complex.
 *
 * @param {string} text - Raw CSV string
 * @returns {string[][]} Array of rows, each row is an array of cell values
 */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  return lines.map((line) => {
    const fields = [];
    let field = '';
    let inQuote = false;
    for (const char of line) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());
    return fields;
  });
}

export default function CsvTable({ src }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${src}: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        setRows(parsed);
        setFilters(Array(parsed[0]?.length ?? 0).fill(''));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  if (loading) return <p>Loading table…</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (rows.length === 0) return <p>No data.</p>;

  const [header, ...dataRows] = rows;

  const filtered = dataRows.filter((row) =>
    filters.every(
      (f, i) => f === '' || (row[i] ?? '').toLowerCase().includes(f.toLowerCase())
    )
  );

  const handleFilterChange = (colIdx, value) => {
    setFilters((prev) => {
      const next = [...prev];
      next[colIdx] = value;
      return next;
    });
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {header.map((col, i) => (
              <th key={i}>
                {col}
                <br />
                <input
                  type="text"
                  placeholder={`Filter ${col}`}
                  value={filters[i] ?? ''}
                  onChange={(e) => handleFilterChange(i, e.target.value)}
                  style={{ width: '100%', fontWeight: 'normal', fontSize: '0.85em' }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={header.length} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No results match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
