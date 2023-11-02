/// <reference types="vite/client" />
declare module '@kangc/v-md-editor/lib/theme/vuepress.js'
declare module 'view-ui-plus'
declare module '@kangc/v-md-editor'
declare module '@kangc/v-md-editor/lib/preview'
declare module '@kangc/v-md-editor/lib/theme/github.js'
declare module 'prismjs'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}
