import { defineComponent } from 'vue'
import styles from './index.module.scss'
const props = {
  file: {
    type: Object,
    default: () => {}
  }
}
export default defineComponent({
  props: props,
  render() {
    const content = this.file?.default || '内容获取失败'
    return (
      <div class={styles.containerWrpaer}>
        <v-md-preview text={content}></v-md-preview>
      </div>
    )
  }
})
