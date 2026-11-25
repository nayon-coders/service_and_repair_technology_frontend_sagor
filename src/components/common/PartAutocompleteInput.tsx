import React, { useState, useRef, useEffect } from 'react';
import { Package, Check, Layers, AlertCircle } from 'lucide-react';
import { LabPartRecord } from '../../types';

export interface PartAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPart: (part: LabPartRecord) => void;
  parts: LabPartRecord[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const PartAutocompleteInput: React.FC<PartAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectPart,
  parts = [],
  placeholder = 'Spare part description from Lab...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter parts based on input query
  const query = (value || '').trim().toLowerCase();
  const filteredParts = query
    ? parts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.partNumber && p.partNumber.toLowerCase().includes(query))
      )
    : parts.slice(0, 8); // Show top 8 parts when input is empty

  const handleSelect = (part: LabPartRecord) => {
    onSelectPart(part);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < filteredParts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredParts.length) {
        e.preventDefault();
        handleSelect(filteredParts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => {
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        required={required}
      />

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[320px] max-w-[420px] z-[120] bg-white rounded-lg shadow-xl border border-slate-200 py-1 max-h-60 overflow-y-auto">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-600">
              <Package className="w-3 h-3 text-blue-500" />
              Lab Inventory Spare Parts ({parts.length})
            </span>
            <span className="text-[9px] text-slate-400 lowercase">select to auto-fill</span>
          </div>

          {filteredParts.length === 0 ? (
            <div className="p-3 text-center">
              <AlertCircle className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 font-medium">কোনো পার্টস পাওয়া যায়নি</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                কাস্টম বিবরণ হিসেবে সরাসরি টাইপ করতে পারেন।
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredParts.map((part, idx) => {
                const isSelected = part.name.toLowerCase() === (value || '').trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={part.id || idx}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(part)}
                    className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-blue-50 text-blue-900'
                        : isSelected
                        ? 'bg-slate-50 text-slate-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate text-slate-900">
                          {part.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        {part.partNumber && (
                          <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono text-[9px]">
                            #{part.partNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Layers className="w-2.5 h-2.5 text-slate-400" />
                          Stock:
                          <span
                            className={`font-semibold ml-0.5 ${
                              Number(part.stockQuantity) > 0 ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {part.stockQuantity} {part.unit || 'pcs'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-blue-700 font-mono">
                        ৳ {Number(part.unitPrice).toLocaleString()}
                      </div>
                      <span className="text-[9px] text-slate-400">Unit Price</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
