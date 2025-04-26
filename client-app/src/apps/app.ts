import '../Bootstrap';

import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AppComponent} from '../app/AppComponent';
import {AppModel} from '../app/AppModel';
import {AuthModel} from '../core/security/AuthModel';

XH.renderApp({
    clientAppCode: 'app',
    clientAppName: 'Musiclüb',
    modelClass: AppModel,
    componentClass: AppComponent,
    authModelClass: AuthModel,
    containerClass: AppContainer,
    isMobileApp: false,
    enableLogout: true,
    webSocketsEnabled: true,
    checkAccess: () => true
});
