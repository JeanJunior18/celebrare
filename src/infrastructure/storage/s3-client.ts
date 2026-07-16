import { S3Client } from '@aws-sdk/client-s3';

// Único lugar do projeto autorizado a importar `@aws-sdk/client-s3`
// (docs/saas-platform-plan.md, fase 6). Hoje aponta pro endpoint
// S3-compatible do Supabase Storage; trocar de provider é só mudar essas
// env vars, sem tocar em `S3MediaStorage`.
export function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}
