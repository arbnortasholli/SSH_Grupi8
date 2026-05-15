type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'lowest-price', label: 'Lowest price' },
  { value: 'highest-price', label: 'Highest price' },
  { value: 'lowest-mileage', label: 'Lowest mileage' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => (
  <label className="sort-dropdown">
    <span>Sort by</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
