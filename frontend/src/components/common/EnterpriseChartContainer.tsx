import React, { useState, useRef } from 'react';
import {
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Filter,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface SeriesToggle {
  key: string;
  name: string;
  color: string;
}

interface EnterpriseChartContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  seriesList?: SeriesToggle[];
  activeSeries?: Record<string, boolean>;
  onToggleSeries?: (key: string) => void;
  data: any[];
  csvFilename?: string;
  timeRanges?: string[];
  activeTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  children: React.ReactNode;
}

export const EnterpriseChartContainer: React.FC<EnterpriseChartContainerProps> = ({
  title,
  subtitle,
  icon: Icon,
  seriesList = [],
  activeSeries = {},
  onToggleSeries,
  data,
  csvFilename = 'chart_telemetry_export.csv',
  timeRanges = ['1H', '6H', '24H', '7D', 'Live'],
  activeTimeRange = 'Live',
  onTimeRangeChange,
  children,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const [isZoomed, setIsZoomed] = useState(false);
  const isLight = theme === 'light';

  // Export Data to CSV file
  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header];
        return typeof val === 'string' ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Chart SVG to PNG Image
  const handleExportPNG = () => {
    if (!chartRef.current) return;
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = svgElement.clientWidth * 2 || 1200;
      canvas.height = svgElement.clientHeight * 2 || 600;
      if (ctx) {
        ctx.fillStyle = isLight ? '#FFFFFF' : '#0B0E17';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = csvFilename.replace('.csv', '.png');
        link.href = png;
        link.click();
      }
    };
    img.src = blobURL;
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      {/* Chart Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-base font-extrabold tracking-tight flex items-center space-x-2">
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filters */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            {timeRanges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => onTimeRangeChange && onTimeRangeChange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTimeRange === range
                    ? 'bg-blue-500 text-white font-bold shadow-sm'
                    : 'text-muted-foreground hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Reset Zoom' : 'Zoom In'}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 transition-all ${
              isZoomed
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'border-white/10 hover:bg-white/5 text-muted-foreground'
            }`}
          >
            {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPNG}
            title="Export Chart as PNG Image"
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            title="Download Time-series Data as CSV"
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Series Legend Toggles */}
      {seriesList.length > 0 && onToggleSeries && (
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-[11px] text-muted-foreground/70 uppercase font-bold mr-1">Series:</span>
          {seriesList.map((s) => {
            const isVisible = activeSeries[s.key] !== false;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleSeries(s.key)}
                className={`px-3 py-1 rounded-xl border flex items-center space-x-2 transition-all ${
                  isVisible
                    ? 'bg-white/5 border-white/15 text-foreground shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-muted-foreground opacity-50 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
                {isVisible ? <Eye className="w-3 h-3 text-blue-400" /> : <EyeOff className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Chart Canvas Area */}
      <div ref={chartRef} className={`w-full transition-all ${isZoomed ? 'h-96' : 'h-72'}`}>
        {children}
      </div>
    </div>
  );
};
