import { defineComponent, ref, Suspense } from 'vue'
import Header from '@/components/Header/Header'
import Side from '@/components/Side'
import Container from '@/components/Container'
export default defineComponent({
  setup() {
    const fileContent = ref('')
    const onChangeFile = (content: string) => {
      fileContent.value = content
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
          <Side onChangeFile={(content: string) => this.onChangeFile(content)} />
        </Suspense>
      </>
    )
  }
})
