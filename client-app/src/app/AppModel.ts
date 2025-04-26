import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {sizingModeAppOption, themeAppOption} from '@xh/hoist/desktop/cmp/appOption';
import {Icon} from '@xh/hoist/icon';
import {ClubService} from '../core/services/ClubService';
import {homeTab} from './home/HomeTab';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    @managed
    tabModel: TabContainerModel = new TabContainerModel({
        route: 'default',
        track: true,
        switcher: false,
        tabs: [
            {id: 'home', icon: Icon.home(), content: homeTab}
        ]
    });

    override async initAsync() {
        await super.initAsync();
        await XH.installServicesAsync(ClubService);
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        await XH.clubService.loadAsync(loadSpec);
    }

    override getRoutes() {
        return [
            {
                name: 'default',
                path: '/app',
                children: [
                    {
                        name: 'home',
                        path: '/home'
                    }
                ]
            }
        ];
    }

    override getAppOptions() {
        return [
            themeAppOption(),
            sizingModeAppOption()
        ];
    }

}
