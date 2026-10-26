export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

// Contrato del almacenamiento de archivos: el dominio no sabe que detrás está Supabase
export interface IStorageService {
  // Sube el archivo y devuelve su URL pública
  upload(path: string, file: UploadedImage): Promise<string>;
  // Borra el archivo si la URL pertenece a nuestro storage; ignora URLs externas
  removeByUrl(url: string): Promise<void>;
}
