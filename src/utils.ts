export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[\/\-]/);
  
  if (parts.length === 2) {
    let month = parseInt(parts[0], 10);
    let year = parts[1];
    
    // Check if format is YYYY-MM
    if (parts[0].length === 4) {
      year = parts[0];
      month = parseInt(parts[1], 10);
    }
    
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    if (month >= 1 && month <= 12 && year.length >= 2) {
      // Return e.g. "Enero 2023"
      return `${months[month - 1]} ${year}`;
    }
  }
  
  return trimmed;
}
