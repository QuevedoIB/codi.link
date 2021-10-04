import VitePluginCdn from 'vite-plugin-cdn'

export default {
  plugins: [
    VitePluginCdn({
      esm: true,
      modules: [
        {
          name: 'monaco-vscode-textmate-theme-converter',
          url: 'https://cdn.jsdelivr.net/npm/monaco-vscode-textmate-theme-converter@0.1.7/lib/cjs/index.js'
        }
      ]
    })
  ]
}
