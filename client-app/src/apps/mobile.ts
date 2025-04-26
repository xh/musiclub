import '../Bootstrap';

import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/mobile/appcontainer';
import {AppComponent} from '../mobile/AppComponent';
import {AppModel} from '../mobile/AppModel';
import {AuthModel} from '../core/security/AuthModel';

XH.renderApp({
    clientAppCode: 'mobile',
    clientAppName: 'Musiclüb',
    modelClass: AppModel,
    componentClass: AppComponent,
    authModelClass: AuthModel,
    containerClass: AppContainer,
    isMobileApp: true,
    enableLogout: true,
    webSocketsEnabled: true,
    checkAccess: () => true
});
