import React, { useRef, useState, ChangeEvent } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export interface FileUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helperText,
  required,
  accept,
  maxSizeMB = 5,
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (file: File | null) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    handleFiles(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors duration-150 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50'
              : error
                ? 'border-rose-300 bg-rose-50/20'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-700">
            Click to upload or drag & drop
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PDF, PNG, JPG up to {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <File className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-medium text-slate-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error ? (
        <p className="text-[11px] text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

