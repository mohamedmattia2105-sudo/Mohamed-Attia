import React, { useState, useRef } from 'react';
import { X, Upload, Check, Copy, RefreshCw, Code2 } from 'lucide-react';
import { Language } from '../types/dashboard';
import { DEFAULT_GOOGLE_SHEET_CSV_URL, TRANSLATIONS } from '../utils/i18n';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  sheetUrl: string;
  onApplySheetUrl: (url: string) => void;
  onUploadCustomCsv: (csvText: string, fileName: string) => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  lang,
  sheetUrl,
  onApplySheetUrl,
  onUploadCustomCsv,
}) => {
  const t = TRANSLATIONS[lang];
  const [inputUrl, setInputUrl] = useState(sheetUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || '');
      if (text.trim()) {
        onUploadCustomCsv(text, file.name);
        onClose();
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.dataSourceModalTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.dataSourceModalDesc}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-5">
          {/* Google Sheets CSV URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.sheetUrlLabel}
            </label>
            <input
              type="url"
              dir="ltr"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  onApplySheetUrl(inputUrl.trim() || DEFAULT_GOOGLE_SHEET_CSV_URL);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.applySheetUrlBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputUrl(DEFAULT_GOOGLE_SHEET_CSV_URL);
                  onApplySheetUrl(DEFAULT_GOOGLE_SHEET_CSV_URL);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {t.restoreDefaultSheetBtn}
              </button>
            </div>
          </div>

          {/* Custom CSV File Upload */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-800">{t.uploadCsvTitle}</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">{t.uploadCsvDesc}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg transition-colors cursor-pointer w-full justify-center"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>{t.selectCsvFileBtn}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

interface GoogleSitesEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const GoogleSitesEmbedModal: React.FC<GoogleSitesEmbedModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [copiedType, setCopiedType] = useState<'url' | 'iframe' | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const iframeSnippet = `<iframe src="${currentUrl}" width="100%" height="920" style="border:0; background:#ffffff; border-radius:12px;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

  const handleCopy = (text: string, type: 'url' | 'iframe') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.embedModalTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.embedModalDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-5">
          {/* Option 1: Direct URL */}
          <div>
            <h4 className="text-xs font-bold text-slate-800">{t.embedUrlLabel}</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{t.embedUrlSteps}</p>
            <div className="flex items-center gap-2" dir="ltr">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
              <button
                type="button"
                onClick={() => handleCopy(currentUrl, 'url')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedType === 'url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.copiedText}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyUrlBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Iframe Embed Code */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800">{t.embedIframeLabel}</h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{t.embedIframeSteps}</p>
            <div className="space-y-2" dir="ltr">
              <textarea
                readOnly
                rows={3}
                value={iframeSnippet}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 resize-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(iframeSnippet, 'iframe')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedType === 'iframe' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-700" />
                    <span>{t.copiedText}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyIframeBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
