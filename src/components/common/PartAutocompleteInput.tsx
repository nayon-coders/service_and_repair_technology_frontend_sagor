import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 320,
    placeAbove: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate and update screen coordinates for portal
  const updateCoords = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const dropdownHeight = 250;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip to above if below doesn't have enough room and above has more
    const placeAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setCoords({
      top: placeAbove ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 360),
      placeAbove,
    });
  }, []);

  // Update coords whenever opened, scrolled, or resized
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
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
    : parts.slice(0, 10); // Show top 10 parts when input is empty

  const handleSelect = (part: LabPartRecord) => {
    onSelectPart(part);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        updateCoords();
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

  const dropdownMenu = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        transform: coords.placeAbove ? 'translateY(-100%)' : 'none',
        zIndex: 99999,
      }}
      className="bg-white rounded-xl shadow-2xl border border-slate-300 py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-700">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          Lab Spare Parts Inventory ({parts.length})
        </span>
        <span className="text-[9px] text-slate-400 lowercase font-medium">ক্লিক করলেই অটো-ফিল হবে</span>
      </div>

      {filteredParts.length === 0 ? (
        <div className="p-3.5 text-center">
          <AlertCircle className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className="text-xs text-slate-600 font-semibold">কোনো ল্যাব পার্টস পাওয়া যায়নি</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            কাস্টম পার্টস নাম হিসেবে সরাসরি ব্যবহার করতে পারেন।
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
                className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                  isHighlighted
                    ? 'bg-blue-50 text-blue-900'
                    : isSelected
                    ? 'bg-slate-100/80 text-slate-900'
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

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    {part.partNumber && (
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[9px] font-medium border border-slate-200">
                        #{part.partNumber}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Stock:
                      <span
                        className={`font-bold ml-0.5 ${
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
  );

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
          updateCoords();
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => {
          updateCoords();
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        required={required}
      />

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
};
