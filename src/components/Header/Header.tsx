import { defineComponent } from 'vue'
import styles from './index.module.scss'
import { Button } from 'view-ui-plus'
export default defineComponent({
  render() {
    return (
      <div class={styles.header}>
        <div>知识总结</div>
        <div class={styles.login}>
          <div class={styles.loginItem}>
            <Button type="success" onClick={() => this.$router.push('/login')}>
              登录
            </Button>
          </div>
        </div>
      </div>
    )
  }
})
