import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Android home-screen widget (widgets/). Needs a development build — in Expo Go
// the native module is missing, so skip it there instead of crashing.
try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./widgets/widgetTaskHandler');
    registerWidgetTaskHandler(widgetTaskHandler);
} catch (err) {
    console.log('[widget] not available here (Expo Go / web / iOS):', err.message);
}
