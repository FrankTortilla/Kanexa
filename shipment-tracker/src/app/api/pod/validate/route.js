import { NextResponse } from 'next/server';

// Magic byte signatures for allowed file types
const SIGNATURES = {
  pdf:  { bytes: [0x25, 0x50, 0x44, 0x46], len: 4 },  // %PDF
  jpeg: { bytes: [0xFF, 0xD8, 0xFF],        len: 3 },
  png:  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], len: 8 },
};

function detectMimeFromBytes(bytes) {
  for (const [, sig] of Object.entries(SIGNATURES)) {
    if (bytes.length >= sig.len && sig.bytes.every((b, i) => bytes[i] === b)) {
      return true;
    }
  }
  return false;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ valid: false, reason: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 8));

    if (!detectMimeFromBytes(bytes)) {
      return NextResponse.json(
        { valid: false, reason: 'File type not allowed. Only PDF, JPG, and PNG are accepted.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, reason: 'Validation failed' }, { status: 500 });
  }
}
