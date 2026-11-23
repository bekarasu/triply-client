import { devTools } from './flag'
import { installConsoleLogger } from './installConsoleLogger'
import { installNetworkLogger } from './installNetworkLogger'

// First import of app/_layout.tsx: runs after Expo has installed its fetch, before the app's own code logs or fetches.
if (devTools) {
	installConsoleLogger()
	installNetworkLogger()
}
