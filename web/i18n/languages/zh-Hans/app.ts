import { verify } from "crypto";

const translation = {
  blog: '博客',
  go_to_login: '去登录',
  introduction: '这是一篇博客介绍',
  title: 'Monie（萌艺） —— 您的智能体应用创意工坊',
  description: 'Monie（萌艺）是一个开放、灵活的智能体应用平台，致力于让每个人都能轻松构建属于自己的AI驱动应用。无论您是企业开发者、创作者还是企业，Monie 都为您提供了一站式的智能体设计、部署和管理体验。',
  welcome: '欢迎使用我们的应用',
  common: {
    view_all_features: '查看所有功能',
    switch_to_english: '切换到英文',
    switch_to_chinese: '切换到中文',
    switch_to_dark: '切换深色模式',
    switch_to_light: '切换浅色模式',
    nav_title: '菜单',
  },
  actions: {
    confirm: '确定',
    cancel: '取消',
    close: '关闭',
    change: '更改',
    verify: '验证',
    back: '返回',
  },
  theme: {
    system: '跟随系统',
    system_light: '跟随系统（浅色）',
    system_dark: '跟随系统（深色）',
    light: '浅色模式',
    dark: '深色模式',
    select_theme: '选择主题',
    current_theme: '当前主题：{{theme}}',

    descriptions: {
      system: '自动根据系统设置切换',
      light: '明亮的界面',
      dark: '护眼的界面'
    }
  },
  colorTheme: {
    blue: '蓝色主题',
    green: '绿色主题',
    amber: '琥珀主题',
  },
  icons: {
    monitor: '系统图标',
    sun: '太阳图标',
    moon: '月亮图标',
  },
  back_workspace: '返回工作空间',
};
export default translation;
