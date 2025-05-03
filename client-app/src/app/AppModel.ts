import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, LoadSpec, XH} from '@xh/hoist/core';
import {sizingModeAppOption, themeAppOption} from '@xh/hoist/desktop/cmp/appOption';
import {Icon} from '@xh/hoist/icon';
import {ClubService} from '../core/services/ClubService';
import {mbEntitiesRestGrid} from './admin/MbEntitiesRestGrid';
import {meetingsRestGrid} from './admin/MeetingsRestGrid';
import {playsRestGrid} from './admin/PlaysRestGrid';
import {homeTab} from './home/HomeTab';
import {GridModel} from '@xh/hoist/cmp/grid';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    tabModel: TabContainerModel;

    override async initAsync() {
        await super.initAsync();
        await XH.installServicesAsync(ClubService);

        GridModel.DEFAULT_AUTOSIZE_MODE = 'managed';

        const omit = !XH.getUser().hasRole('MUSICLUB_ADMIN');
        this.tabModel = new TabContainerModel({
            route: 'default',
            track: true,
            switcher: false,
            tabs: [
                {id: 'home', icon: Icon.home(), content: homeTab},
                {id: 'meetings', icon: Icon.users(), content: meetingsRestGrid, omit},
                {id: 'plays', icon: Icon.list(), content: playsRestGrid, omit},
                {id: 'entities', icon: Icon.database(), content: mbEntitiesRestGrid, omit}
            ]
        });
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
                    {name: 'home', path: '/home'},
                    {name: 'meetings', path: '/meetings'},
                    {name: 'plays', path: '/plays'},
                    {name: 'entities', path: '/entities'}
                ]
            }
        ];
    }

    override getAppOptions() {
        return [themeAppOption(), sizingModeAppOption()];
    }
}
