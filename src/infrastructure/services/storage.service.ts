import type { IStorageService, UploadedImage } from '../../domain/services/IStorage.service.js';

// Supabase Storage vía API REST (HTTPS). La service_role key solo vive en el backend
export class SupabaseStorageService implements IStorageService {
  private readonly baseUrl: string;
  private readonly key: string;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias para subir imágenes');
    }
    this.baseUrl = url.replace(/\/$/, '');
    this.key = key;
    this.bucket = process.env.SUPABASE_BUCKET || 'experiencias';
  }

  private get publicPrefix(): string {
    return `${this.baseUrl}/storage/v1/object/public/${this.bucket}/`;
  }

  async upload(path: string, file: UploadedImage): Promise<string> {
    const res = await fetch(`${this.baseUrl}/storage/v1/object/${this.bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.key}`,
        apikey: this.key,
        'Content-Type': file.mimetype,
        'x-upsert': 'true',
      },
      body: new Uint8Array(file.buffer),
    });
    if (!res.ok) {
      throw new Error(`Supabase Storage respondió ${res.status} al subir ${path}`);
    }
    return `${this.publicPrefix}${path}`;
  }

  async removeByUrl(url: string): Promise<void> {
    if (!url.startsWith(this.publicPrefix)) return;
    const path = url.slice(this.publicPrefix.length);
    const res = await fetch(`${this.baseUrl}/storage/v1/object/${this.bucket}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.key}`, apikey: this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: [path] }),
    });
    // Si falla el borrado no se rompe la operación principal: queda un archivo huérfano
    if (!res.ok) {
      console.error(`No se pudo borrar ${path} de Supabase Storage (${res.status})`);
    }
  }
}
