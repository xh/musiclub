import {PWAInstallElement} from '@khmyznikov/pwa-install';
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, loadAllAsync, LoadSpec, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {makeObservable} from '@xh/hoist/mobx';
import {createObservableRef} from '@xh/hoist/utils/react';
import {memberIcon} from '../core/Icons';
import {ClubService} from '../core/services/ClubService';
import {SearchService} from '../core/services/SearchService';
import {bookmarkList} from './bookmarks/BookmarkList';
import {meetingList} from './meeting/list/MeetingList';
import {memberList} from './member/list/MemberList';
import {searchList} from './search/SearchList';
import {settingsPanel} from './settings/SettingsPanel';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    readonly pwaInstallRef = createObservableRef<PWAInstallElement>();
    readonly pwaInstallDescription = `Musiclüb looks and works better when added to your phone's home screen. Give it a spin.`;

    tabContainerModel: TabContainerModel = new TabContainerModel({
        route: 'mobile',
        tabs: [
            {
                id: 'meetings',
                title: null,
                icon: Icon.calendar(),
                content: meetingList
            },
            {
                id: 'members',
                title: null,
                icon: memberIcon(),
                content: memberList
            },
            {
                id: 'search',
                title: null,
                icon: Icon.search(),
                content: searchList
            },
            {
                id: 'bookmarks',
                title: null,
                icon: Icon.bookmark(),
                content: bookmarkList
            },
            {
                id: 'settings',
                title: null,
                icon: Icon.ellipsisHorizontal(),
                content: settingsPanel
            }
        ]
    });

    constructor() {
        super();
        makeObservable(this);
    }

    override getRoutes() {
        return [
            {
                name: 'mobile',
                path: '/mobile',
                forwardTo: 'mobile.meetings',
                children: [
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
                        name: 'search',
                        path: '/search',
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
                            },
                            {
                                name: 'meeting',
                                path: '/meeting/:meetingSlug',
                                children: [
                                    {
                                        name: 'play',
                                        path: '/:playSlug'
                                    }
                                ]
                            },
                            {
                                name: 'play',
                                path: '/:playSlug'
                            }
                        ]
                    },
                    {
                        name: 'bookmarks',
                        path: '/bookmarks',
                        children: [
                            {
                                name: 'play',
                                path: '/:playSlug'
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
        await XH.installServicesAsync(SearchService);
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        await loadAllAsync([XH.clubService], loadSpec);
    }

    override get supportsVersionBar() {
        return false;
    }
}

/**
 * Capture the `beforeinstallprompt` event, adding listener as early as we can to catch it, and
 * stash for later use by pwa-installer. AppComponent renders the PWAInstall element, SettingsPanel
 * uses the ref to show a button to trigger the dialog.
 *
 * Prevent default to avoid showing an automatic system prompt on Android.
 */
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    // @ts-ignore
    window.pwaInstallEvent = e;
});
