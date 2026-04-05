import { useEffect } from "react";
import { getTaxYear, setTaxYear as saveTaxYear } from "../services/cache";

interface TaxYearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

const START_YEAR = 2023;
const MAX_YEAR = 2025;

function getYears(): number[] {
  const years: number[] = [];
  for (let y = MAX_YEAR; y >= START_YEAR; y--) {
    years.push(y);
  }
  return years;
}

export function getDefaultTaxYear(): number {
  const cached = getTaxYear();
  if (cached !== null && cached >= START_YEAR) return cached;
  return 2025;
}

export default function TaxYearSelector({ value, onChange }: TaxYearSelectorProps) {
  const years = getYears();

  useEffect(() => {
    saveTaxYear(value);
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tax Year
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
