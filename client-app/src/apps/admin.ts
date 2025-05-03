import '../Bootstrap';
import {AppComponent} from '@xh/hoist/admin/AppComponent';
import {AppModel} from '@xh/hoist/admin/AppModel';
import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AuthModel} from '../core/security/AuthModel';

XH.renderAdminApp({
    modelClass: AppModel,
    componentClass: AppComponent,
    authModelClass: AuthModel,
    containerClass: AppContainer,
    enableLogout: true
});
