export interface StudentData {
  noPendaftaran: string;
  nama: string;
  programKeahlian: string;
  password: string;
  status: string;
}

export async function fetchSpreadsheetData(spreadsheetId: string, accessToken: string): Promise<StudentData[]> {
  // First, fetch the spreadsheet metadata to get the name of the first sheet
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!metaRes.ok) {
    const errorData = await metaRes.json();
    throw new Error(errorData.error?.message || 'Failed to fetch spreadsheet metadata');
  }

  const metaData = await metaRes.json();
  if (!metaData.sheets || metaData.sheets.length === 0) {
    throw new Error('No sheets found in the spreadsheet');
  }

  // Get the title of the first sheet
  const sheetTitle = metaData.sheets[0].properties.title;

  // Now fetch the values of the first sheet
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch spreadsheet values');
  }

  const data = await res.json();
  const rows = data.values || [];

  if (rows.length < 2) {
    return []; // No data rows
  }

  // Assume first row is header
  const headers = rows[0].map((h: string) => h.toLowerCase().trim());
  
  // Find column indexes
  // Possible header names (flexible)
  const noDaftarIdx = headers.findIndex((h: string) => h.includes('no') && (h.includes('pendaftaran') || h.includes('daftar')));
  const namaIdx = headers.findIndex((h: string) => h.includes('nama'));
  const programIdx = headers.findIndex((h: string) => h.includes('program') || h.includes('jurusan') || h.includes('keahlian'));
  const passwordIdx = headers.findIndex((h: string) => h.includes('password') || h.includes('pass') || h.includes('sandi'));
  const statusIdx = headers.findIndex((h: string) => h.includes('status') || h.includes('keterangan'));

  if (noDaftarIdx === -1 || passwordIdx === -1 || statusIdx === -1) {
    throw new Error('Could not find required columns. Please ensure columns exist for: No Pendaftaran, Password, Status');
  }

  const students: StudentData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[noDaftarIdx] && row[passwordIdx]) {
      students.push({
        noPendaftaran: String(row[noDaftarIdx] || '').trim(),
        nama: namaIdx !== -1 ? String(row[namaIdx] || '').trim() : 'Siswa',
        programKeahlian: programIdx !== -1 ? String(row[programIdx] || '').trim() : '-',
        password: String(row[passwordIdx] || '').trim(),
        status: String(row[statusIdx] || '').trim()
      });
    }
  }

  return students;
}
