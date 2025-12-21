// Utility functions for customer management

/**
 * Generate a username from full name with random suffix
 */
export function generateUsername(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}_${suffix}`;
}

/**
 * Generate a secure random password
 */
export function generatePassword(length = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%';
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle the password
  return password.sort(() => Math.random() - 0.5).join('');
}

/**
 * Export columns configuration for customers
 */
export interface ExportField {
  key: string;
  label: string;
  defaultSelected: boolean;
}

export const customerExportFields: ExportField[] = [
  { key: 'name', label: 'Full Name', defaultSelected: true },
  { key: 'email', label: 'Email', defaultSelected: true },
  { key: 'username', label: 'Username', defaultSelected: false },
  { key: 'status', label: 'Status', defaultSelected: true },
  { key: 'segment', label: 'Segment', defaultSelected: false },
  { key: 'balance', label: 'Balance', defaultSelected: true },
  { key: 'totalSpent', label: 'Total Spent', defaultSelected: true },
  { key: 'totalOrders', label: 'Orders', defaultSelected: true },
  { key: 'joinedAt', label: 'Join Date', defaultSelected: false },
  { key: 'lastActive', label: 'Last Active', defaultSelected: false },
];

/**
 * Generate CSV from customers with selected fields
 */
export function generateCustomerCSV<T extends Record<string, any>>(
  customers: T[],
  selectedFields: string[],
  fields: ExportField[]
): string {
  const selectedFieldConfigs = fields.filter(f => selectedFields.includes(f.key));
  const headers = selectedFieldConfigs.map(f => f.label);
  
  const rows = customers.map(customer => 
    selectedFieldConfigs.map(field => {
      const value = customer[field.key];
      if (typeof value === 'number') {
        return field.key === 'balance' || field.key === 'totalSpent' 
          ? `$${value.toFixed(2)}` 
          : value.toString();
      }
      return String(value ?? '');
    })
  );
  
  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

/**
 * Generate printable HTML for PDF export
 */
export function generateCustomerPrintHTML<T extends Record<string, any>>(
  customers: T[],
  selectedFields: string[],
  fields: ExportField[],
  title: string
): string {
  const selectedFieldConfigs = fields.filter(f => selectedFields.includes(f.key));
  
  const tableRows = customers.map(customer => {
    const cells = selectedFieldConfigs.map(field => {
      const value = customer[field.key];
      if (typeof value === 'number') {
        return field.key === 'balance' || field.key === 'totalSpent' 
          ? `$${value.toFixed(2)}` 
          : value.toString();
      }
      return String(value ?? '');
    }).map(cell => `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  const tableHeaders = selectedFieldConfigs
    .map(f => `<th style="padding: 12px; text-align: left; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-weight: 600;">${f.label}</th>`)
    .join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
        h1 { margin-bottom: 8px; }
        .subtitle { color: #6b7280; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;
}
