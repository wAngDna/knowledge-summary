import { defineComponent, ref, Suspense } from 'vue'
import Header from '@/components/Header/Header'
import Side from '@/components/Side'
import Container from '@/components/Container'
export default defineComponent({
  setup() {
    const fileContent = ref('')
    const onChangeFile = (file: any) => {
      fileContent.value = file
    }
    return {
      fileContent,
      onChangeFile
    }
  },
  render() {
    return (
      <>
        <Header />
        <Container fileContent={this.fileContent} />
        <Suspense>
          <Side onChangeFile={(file: any) => this.onChangeFile(file)} />
        </Suspense>
      </>
    )
  }
})
