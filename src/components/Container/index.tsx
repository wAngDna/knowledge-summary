import { defineComponent, onMounted, ref, watch } from 'vue'
import styles from './index.module.scss'
const props = {
  fileContent: {
    type: String,
    default: ''
  }
}
export default defineComponent({
  props: props,
  setup(props) {
    const containerWrpaer = ref()
    watch(
      () => props.fileContent,
      () => {
        if (props.fileContent) {
          containerWrpaer.value.scrollTop = 0
        }
      }
    )
    return {
      containerWrpaer
    }
  },
  render() {
    return (
      <div ref="containerWrpaer" class={styles.containerWrpaer}>
        <v-md-preview text={this.fileContent || ''}></v-md-preview>
      </div>
    )
  }
})
