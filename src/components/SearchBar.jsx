import { useId, useRef } from 'react';

export default function SearchBar({ value, onChange, resultCount, totalCount, disabled }) {
  const inputRef = useRef(null);
  const statusId = useId();
  const hasQuery = value.trim().length > 0;

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search" role="search">
      <div className="search-field">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="搜尋商品，例如：無線、鍵盤、USB"
          aria-label="搜尋商品"
          aria-describedby={statusId}
          value={value}
          maxLength={50}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && value) {
              e.preventDefault();
              onChange('');
            }
          }}
        />
        {value && (
          <button type="button" className="search-clear" aria-label="清除搜尋" onClick={clear}>
            ×
          </button>
        )}
      </div>
      <p id={statusId} className="search-status" aria-live="polite">
        {hasQuery && !disabled ? `找到 ${resultCount} / ${totalCount} 件商品` : ''}
      </p>
    </div>
  );
}
