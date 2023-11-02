import { defineComponent, ref, Suspense } from 'vue'
import Header from '@/components/Header/Header'
import Side from '@/components/Side'
import Container from '@/components/Container'
export default defineComponent({
  setup() {
    const currentFile = ref({})
    const onChangeFile = (file: any) => {
      currentFile.value = file
    }
    return {
      currentFile,
      onChangeFile
    }
  },
  render() {
    return (
      <>
        <Header />
        <Container file={this.currentFile} />
        <Suspense>
          <Side onChangeFile={(file: any) => this.onChangeFile(file)} />
        </Suspense>
      </>
    )
  }
})
