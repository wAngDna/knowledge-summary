import { FileType } from '@/types/file'
import Axios from 'axios'
export default async function useDirectory(file: FileType): Promise<string> {
  const fileRaw = new URL(file.fileUrl.default, import.meta.url).href
  const { data } = await Axios.get(fileRaw)
  return data
}
