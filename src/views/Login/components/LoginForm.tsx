import { defineComponent, ref } from 'vue'
import styles from '../index.module.scss'
import { Button } from 'view-ui-plus'
export default defineComponent({
  setup() {
    const userNameInputRef = ref()
    const userPassWordInputRef = ref()
    const isUserNameFocus = ref(false)
    const isUserPassWordFocus = ref(false)
    const isInputAllSet = ref(false)
    const buttonLoading = ref(false)
    const onfocus = (type: 'userName' | 'userPassWord') => {
      if (type === 'userName') {
        isUserNameFocus.value = true
      }
      if (type === 'userPassWord') {
        isUserPassWordFocus.value = true
      }
    }
    const onblur = (type: 'userName' | 'userPassWord') => {
      if (type === 'userName') {
        if (userNameInputRef.value.value.length <= 0) {
          isUserNameFocus.value = false
        }
      }
      if (type === 'userPassWord') {
        if (userPassWordInputRef.value.value.length <= 0) {
          isUserPassWordFocus.value = false
        }
      }
      if (isUserNameFocus.value && isUserPassWordFocus.value) {
        isInputAllSet.value = true
      }
    }
    const login = () => {
      buttonLoading.value = true
      setTimeout(() => {
        buttonLoading.value = false
      }, 2000)
    }
    return {
      onfocus,
      onblur,
      login,
      isUserNameFocus,
      isUserPassWordFocus,
      userNameInputRef,
      userPassWordInputRef,
      isInputAllSet,
      buttonLoading
    }
  },
  render() {
    return (
      <div class={styles.loginContent}>
        <div class={styles.loginTitle}>
          <span class={styles.title}>Codelin Blog System</span>
        </div>
        <div class={styles.loginForm}>
          <div class={styles.loginFormItem}>
            <span
              class={
                this.isUserNameFocus
                  ? [styles.loginFormItemLabelFocus, styles.loginFormItemLabel]
                  : styles.loginFormItemLabel
              }
            >
              Account
            </span>
            <input
              ref="userNameInputRef"
              class={
                this.isUserNameFocus
                  ? [styles.loginFormItemInput, styles.loginFormItemInputFocus]
                  : styles.loginFormItemInput
              }
              type="text"
              onFocus={() => this.onfocus('userName')}
              onBlur={() => this.onblur('userName')}
            />
            <span
              class={
                this.isUserNameFocus
                  ? [styles.loginFormItemBorderFocus, styles.loginFormItemBorder]
                  : styles.loginFormItemBorder
              }
            />
          </div>
          <div class={styles.loginFormItem}>
            <span
              class={
                this.isUserPassWordFocus
                  ? [styles.loginFormItemLabelFocus, styles.loginFormItemLabel]
                  : styles.loginFormItemLabel
              }
            >
              Password
            </span>
            <input
              ref="userPassWordInputRef"
              class={
                this.isUserPassWordFocus
                  ? [styles.loginFormItemInput, styles.loginFormItemInputFocus]
                  : styles.loginFormItemInput
              }
              type="password"
              onFocus={() => this.onfocus('userPassWord')}
              onBlur={() => this.onblur('userPassWord')}
            />
            <span
              class={
                this.isUserPassWordFocus
                  ? [styles.loginFormItemBorderFocus, styles.loginFormItemBorder]
                  : styles.loginFormItemBorderFocus
              }
            />
          </div>
        </div>
        <Button
          type="primary"
          loading={this.buttonLoading}
          class={this.isInputAllSet ? [styles.loginBtn, styles.loginBtnActive] : styles.loginBtn}
          onClick={() => this.login()}
        >
          {this.buttonLoading ? 'Loading' : 'Login'}
        </Button>
      </div>
    )
  }
})
