import { createApp } from 'vue'
import './style.css'
import App from './App'
import ViewUIPlus from 'view-ui-plus'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark-reasonable.css'
VMdPreview.use(githubTheme, {
  Hljs: hljs
})
import 'view-ui-plus/dist/styles/viewuiplus.css'
const app = createApp(App)
app.use(ViewUIPlus).use(VMdPreview).mount('#app')
