// Port — trocar de provider (R2, S3 real, etc.) é só escrever um novo
// adapter aqui dentro, sem tocar nos repositórios que consomem
// `uploadImageToMedia`/`uploadRemoteImageToMedia` (docs/saas-platform-plan.md,
// fase 6).
export interface MediaStorage {
  upload(path: string, data: Buffer, contentType: string): Promise<string>;
}
