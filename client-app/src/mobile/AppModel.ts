import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, loadAllAsync, LoadSpec, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {meetingIcon, memberIcon} from '../core/Icons';
import {ClubService} from '../core/services/ClubService';
import {meetingList} from './meeting/list/MeetingList';
import {memberList} from './member/list/MemberList';
import {settingsPanel} from './settings/SettingsPanel';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    tabContainerModel: TabContainerModel = new TabContainerModel({
        route: 'mobile',
        tabs: [
            {
                id: 'years',
                title: null,
                icon: Icon.calendar(),
                content: () =>
                    meetingList({
                        modelConfig: {title: 'Years', dim: 'year', route: 'mobile.years'}
                    })
            },
            {
                id: 'meetings',
                title: null,
                icon: meetingIcon(),
                content: () =>
                    meetingList({
                        modelConfig: {
                            title: 'Meetings',
                            dim: null,
                            selectableDims: ['location'],
                            route: 'mobile.meetings'
                        }
                    })
            },
            {
                id: 'members',
                title: null,
                icon: memberIcon(),
                content: () =>
                    memberList({
                        modelConfig: {route: 'mobile.members'}
                    })
            },
            {
                id: 'settings',
                title: null,
                icon: Icon.ellipsisHorizontal(),
                content: () => settingsPanel()
            }
        ]
    });

    override getRoutes() {
        return [
            {
                name: 'mobile',
                path: '/mobile',
                forwardTo: 'mobile.years',
                children: [
                    {
                        name: 'years',
                        path: '/years',
                        children: [
                            {
                                name: 'meeting',
                                path: '/meeting/:meetingSlug',
                                children: [
                                    {
                                        name: 'play',
                                        path: '/:playSlug'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'meetings',
                        path: '/meetings',
                        children: [
                            {
                                name: 'meeting',
                                path: '/meeting/:meetingSlug',
                                children: [
                                    {
                                        name: 'play',
                                        path: '/:playSlug'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'members',
                        path: '/members',
                        children: [
                            {
                                name: 'member',
                                path: '/member/:memberSlug',
                                children: [
                                    {
                                        name: 'play',
                                        path: '/:playSlug'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'settings',
                        path: '/settings'
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
        await loadAllAsync([XH.clubService], loadSpec);
    }

    override get supportsVersionBar() {
        return false;
    }
}
