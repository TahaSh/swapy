import { createApp } from 'veloxi'
import { SwapyConfig, SwapyPlugin, SwapyPluginApi } from './SwapyPlugin'

let app = createApp()
let installed = false
function installPlugin() {
  if (installed) {
    app.updatePlugin<SwapyConfig, SwapyPluginApi>(SwapyPlugin)
    return app
  }
  app.addPlugin<SwapyConfig, SwapyPluginApi>(SwapyPlugin)
  app.run()
  installed = true
  return app
}

export { installPlugin }
