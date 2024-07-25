import { createApp, type VeloxiApp } from 'veloxi'
import { SwapyConfig, SwapyPlugin, SwapyPluginApi } from './SwapyPlugin'

let app: VeloxiApp
export function installPlugin() {
  if (app) {
    app.updatePlugin<SwapyConfig, SwapyPluginApi>(SwapyPlugin)
    return app
  }
  app = createApp()
  app.addPlugin<SwapyConfig, SwapyPluginApi>(SwapyPlugin)
  app.run()
  return app
}

export * from './SwapyPlugin'
