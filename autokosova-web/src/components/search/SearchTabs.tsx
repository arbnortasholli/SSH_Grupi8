export type SearchMode = 'buy' | 'rent';

type SearchTabsProps = {
  activeTab: SearchMode;
  onChange: (tab: SearchMode) => void;
};

export const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onChange }) => (
  <div className="search-tabs" role="tablist" aria-label="Search mode">
    <button
      type="button"
      className={activeTab === 'buy' ? 'active' : undefined}
      onClick={() => onChange('buy')}
      role="tab"
      aria-selected={activeTab === 'buy'}
    >
      Buy
    </button>
    <button
      type="button"
      className={activeTab === 'rent' ? 'active' : undefined}
      onClick={() => onChange('rent')}
      role="tab"
      aria-selected={activeTab === 'rent'}
    >
      Rent
    </button>
  </div>
);
