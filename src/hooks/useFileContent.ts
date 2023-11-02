import { FileType } from '@/types/file'
export default async function useDirectory(file: FileType) {
  const fileRaw = await import('/src' + file.fileUrl.pathname + '?raw')
  return { fileRaw }
}
