import { defineComponent } from 'vue'
import styles from './index.module.scss'
const props = {
  fileContent: {
    type: String,
    default: ''
  }
}
export default defineComponent({
  props: props,
  render() {
    return (
      <div class={styles.containerWrpaer}>
        <v-md-preview text={this.fileContent || ''}></v-md-preview>
      </div>
    )
  }
})
