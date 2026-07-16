import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';

import { createS3Client } from './s3-client';
import type { MediaStorage } from './media-storage';

export class S3MediaStorage implements MediaStorage {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly publicUrlBase: string,
  ) {}

  async upload(path: string, data: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: path, Body: data, ContentType: contentType }),
    );

    return `${this.publicUrlBase}/${path}`;
  }
}

// Composition root chama isso pra obter o `MediaStorage` configurado —
// hoje aponta pro bucket `media` do Supabase Storage via S3. `S3_PUBLIC_URL_BASE`
// é a base da URL pública de leitura (separada do endpoint S3 usado pro
// upload); trocar de provider é só mudar `S3_*` sem tocar neste arquivo.
export function createMediaStorage(): MediaStorage {
  const publicUrlBase = `${process.env.S3_PUBLIC_URL_BASE}/${process.env.S3_BUCKET}`;
  return new S3MediaStorage(createS3Client(), process.env.S3_BUCKET!, publicUrlBase);
}
