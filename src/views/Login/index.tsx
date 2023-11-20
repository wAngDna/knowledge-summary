import { defineComponent, ref } from 'vue'
import styles from './index.module.scss'
import bgBannerImg from '@/assets/image/login-banner.png'

import LoginForm from './components/LoginForm'
export default defineComponent({
  setup() {
    const userNameInputRef = ref()
    const userPassWordInputRef = ref()
    const isUserNameFocus = ref(false)
    const isUserPassWordFocus = ref(false)
    const isInputAllSet = ref(false)
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
    return {
      onfocus,
      onblur,
      isUserNameFocus,
      isUserPassWordFocus,
      userNameInputRef,
      userPassWordInputRef,
      isInputAllSet
    }
  },
  render() {
    return (
      <div class={styles.loginWrapper}>
        <div class={styles.loginHeader}></div>
        <div class={styles.bgWraper}>
          <img src={bgBannerImg} alt="" />
          <LoginForm />
        </div>
        <div class={styles.loginFooter}>
          <div class={styles.footerLeft}>
            <div class={styles.leftImage}>
              <img src="./favicon.png" alt="" />
              {/* <span>Codelin Blog System</span> */}
            </div>
            <span class={styles.leftText}>
              ©The website was set up on 2019/06/15. current version v3.1.0
            </span>
          </div>
        </div>
      </div>
    )
  }
})
