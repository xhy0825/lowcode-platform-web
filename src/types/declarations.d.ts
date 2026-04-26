// Element Plus 语言包声明
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any
  export default zhCn
}

// Element Plus 图标扩展声明
declare module '@element-plus/icons-vue' {
  export const Publish: any
}

// Vue Flow PanelPosition 类型扩展
declare module '@vue-flow/additional-components' {
  import { DefineComponent } from 'vue'

  export const Controls: DefineComponent<any, any, any>
  export const MiniMap: DefineComponent<any, any, any>

  interface PanelProps {
    position?: string
  }

  export const Panel: DefineComponent<PanelProps, any, any>
}

// 全局类型扩展
declare global {
  interface Window {
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any
  }
}

export {}