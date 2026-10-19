declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@dcloudio/vite-plugin-uni' {
  import type { Plugin } from 'vite'
  const uni: () => Plugin
  export default uni
}
