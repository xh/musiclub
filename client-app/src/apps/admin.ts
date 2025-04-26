import '../Bootstrap';
import {AppComponent} from '@xh/hoist/admin/AppComponent';
import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AppModel} from '../admin/AppModel';
import {AuthModel} from '../core/security/AuthModel';

XH.renderAdminApp({
    modelClass: AppModel,
    componentClass: AppComponent,
    authModelClass: AuthModel,
    containerClass: AppContainer,
    enableLogout: true
});
