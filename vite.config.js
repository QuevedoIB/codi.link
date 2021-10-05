import inject from '@rollup/plugin-inject'

export default ({ command, mode }) => {
  const config = {}
  if (command === 'build') {
    config.build = {
      rollupOptions: {
        plugins: [
          inject({
            process: 'process'
          })
        ]
      }
    }
  } else {
    config.define = { 'process.env': {} }
  }
  return config
}
