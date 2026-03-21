import React from 'react';
import styles from '../Home.module.css';

export interface FilterOption {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
}

const MOCK_FILTERS: FilterOption[] = [
  { id: 'make', label: 'Make', placeholder: 'Select Make', options: ['Audi', 'BMW', 'Mercedes', 'Toyota', 'Honda'] },
  { id: 'model', label: 'Model', placeholder: 'Select Model', options: ['A4', 'Q7', 'X5', 'C-Class', 'Camry'] },
  { id: 'year', label: 'Year', placeholder: 'Select Year', options: ['2023', '2022', '2021', '2020'] },
  { id: 'price', label: 'Max Price', placeholder: 'Any Price', options: ['$10,000', '$20,000', '$50,000', '$100,000+'] },
];

const FilterDropdown = ({ data }: { data: FilterOption }) => {
  return (
    <div className={styles.filterItem}>
      <span className={styles.filterLabel}>
        {data.label}
      </span>
      <div className={styles.filterValueRow}>
        <span className={styles.filterValue}>
          {data.placeholder}
        </span>
        <svg className={styles.filterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export const SearchFilterBar: React.FC = () => {
  return (
    <div className={styles.filterShell}>
      <div className={styles.filterRow}>
        {MOCK_FILTERS.map((item) => (
          <FilterDropdown key={item.id} data={item} />
        ))}
      </div>

      <button className={styles.filterCta}>
        <svg className={styles.filterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className={styles.filterSearchText}>Search</span>
      </button>
    </div>
  );
};

