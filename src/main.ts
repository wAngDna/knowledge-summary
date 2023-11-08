import { createApp } from 'vue'
import App from './App'
import ViewUIPlus from 'view-ui-plus'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import Prism from 'prismjs'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark-reasonable.css'
VMdPreview.use(githubTheme, {
  Prism,
  Hljs: hljs
})
import 'view-ui-plus/dist/styles/viewuiplus.css'
const app = createApp(App)
app.use(ViewUIPlus).use(VMdPreview).mount('#app')
