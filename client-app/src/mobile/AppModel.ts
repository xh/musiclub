import {HoistAppModel, loadAllAsync, LoadSpec, managed, XH} from '@xh/hoist/core';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {ClubService} from '../core/services/ClubService';
import {listView} from './list/ListView';
import {meetingView} from './meeting/MeetingView';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    @managed
    navigatorModel: NavigatorModel = new NavigatorModel({
        track: true,
        pages: [
            {id: 'default', content: listView},
            {id: 'meeting', content: meetingView}
        ]
    });

    override getRoutes() {
        return [
            {
                name: 'default',
                path: '/musiclub',
                children: [
                    {
                        name: 'meeting',
                        path: '/meeting/:slug<\\d+>'
                    }
                ]
            }
        ];
    }

    override async initAsync() {
        await super.initAsync();
        await XH.installServicesAsync(ClubService);
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        await loadAllAsync([], loadSpec);
    }

    override get supportsVersionBar() {
        return false;
    }
}
