import * as monaco from 'monaco-editor'
import { emmetHTML } from 'emmet-monaco-es'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { getState } from './state.js'
import { $ } from './utils/dom'

import * as themes from './public/assets/themes'

import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate'

const {
  fontSize,
  lineNumbers,
  minimap,
  theme,
  wordWrap,
  fontLigatures,
  fontFamily
} = getState()

const COMMON_EDITOR_OPTIONS = {
  fontSize,
  lineNumbers,
  minimap: {
    enabled: minimap
  },
  wordWrap,
  theme,
  fontLigatures,
  fontFamily,

  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  }
}

emmetHTML(monaco)

window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

// export const createEditor = ({ domElement, language, value }) => {
//   return monaco.editor.create(domElement, {
//     value,
//     language,
//     ...COMMON_EDITOR_OPTIONS
//   })
// }

export async function createEditors (configs) {
  await loadWASM('node_modules/onigasm/lib/onigasm.wasm') // See https://www.npmjs.com/package/onigasm#light-it-up

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const extension = scopeName.split('.')[1]
      return {
        format: 'json',
        content: await (await window.fetch(`src/public/assets/syntaxes/${extension}.tmLanguage.json`)).text()
      }
    }
  })

  // map of monaco "language id's" to TextMate scopeNames
  const grammars = new Map()
  grammars.set('css', 'source.css')
  grammars.set('html', 'text.html.basic')
  grammars.set('typescript', 'source.ts')
  grammars.set('javascript', 'source.js')

  // monaco's built-in themes aren't powereful enough to handle TM tokens
  // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
  Object.entries(themes).forEach(([name, config]) => {
    monaco.editor.defineTheme(name, config)
    const themeSelect = $('.select select[data-for="theme"]')
    const option = document.createElement('option')
    option.text = name
    option.value = name
    themeSelect.appendChild(option)
  })
  const editors = {}
  await Promise.all(configs.map(async ({ language, value, domElement }) => {
    const editor = monaco.editor.create(domElement, {
      value,
      language,
      ...COMMON_EDITOR_OPTIONS
    })
    editors[language] = editor
    return await wireTmGrammars(monaco, registry, grammars, editor)
  }))

  return editors
}
