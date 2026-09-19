/**
 * Universal CSV Exporter for ZManage Operations Consoles
 * Generates RFC-4180 compliant CSV files with UTF-8 BOM encoding for seamless Excel compatibility.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  data: T[],
  columns: CsvColumn<T>[],
  onError?: (msg: string) => void
): boolean {
  if (!data || data.length === 0) {
    if (onError) {
      onError('No records available to export.');
    }
    return false;
  }

  const escapeCsv = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = columns.map(c => escapeCsv(c.header)).join(',');
  const dataRows = data.map(item => 
    columns.map(c => escapeCsv(c.accessor(item))).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}