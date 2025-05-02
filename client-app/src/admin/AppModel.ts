import {AppModel as HoistAdminAppModel} from '@xh/hoist/admin/AppModel';
import {XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {mbEntitiesRestGrid} from './tabs/MbEntitiesRestGrid';
import {meetingsRestGrid} from './tabs/MeetingsRestGrid';
import {playsRestGrid} from './tabs/PlaysRestGrid';

export class AppModel extends HoistAdminAppModel {
    static instance: AppModel;

    override async initAsync() {
        await super.initAsync();
        XH.fetchService.autoGenCorrelationIds = true;
    }

    override getTabRoutes() {
        return [
            ...super.getTabRoutes(),
            {name: 'meetings', path: '/meetings'},
            {name: 'plays', path: '/plays'},
            {name: 'entities', path: '/entities'}
        ];
    }

    override createTabs() {
        return [
            ...super.createTabs(),
            {id: 'meetings', icon: Icon.users(), content: meetingsRestGrid},
            {id: 'plays', icon: Icon.list(), content: playsRestGrid},
            {id: 'entities', icon: Icon.database(), content: mbEntitiesRestGrid}
        ];
    }
}
