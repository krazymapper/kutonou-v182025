import React from 'react';

interface FiltersBarProps {
  villes: string[];
  types: string[];
  selectedVille: string;
  selectedType: string;
  onVilleChange: (ville: string) => void;
  onTypeChange: (type: string) => void;
}

export default function FiltersBar({ villes, types, selectedVille, selectedType, onVilleChange, onTypeChange }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium mb-1">Ville</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedVille}
          onChange={e => onVilleChange(e.target.value)}
        >
          <option value="">Toutes</option>
          {villes.map((ville) => (
            <option key={ville} value={ville}>{ville}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedType}
          onChange={e => onTypeChange(e.target.value)}
        >
          <option value="">Tous</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
} 