import {br, placeholder} from '@xh/hoist/cmp/layout';
import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {playView} from '../play/detail/PlayView';
import {PlayListModel} from '../play/list/PlayListModel';
import {bookmarkListView} from './BookmarkListView';

export class BookmarkListModel extends HoistModel {
    @managed navigatorModel: NavigatorModel;
    @managed playListModel: PlayListModel;

    constructor() {
        super();

        this.navigatorModel = new NavigatorModel({
            track: true,
            route: 'mobile.bookmarks',
            pages: [
                {id: 'bookmarks', content: () => bookmarkListView()},
                {id: 'play', content: playView}
            ]
        });

        this.playListModel = new PlayListModel({
            dataViewConfig: {
                emptyText: placeholder(
                    Icon.bookmark({prefix: 'fat'}),
                    'Bookmark your favorite plays',
                    br(),
                    'to find them again here.'
                )
            }
        });

        this.addReaction({
            track: () => XH.clubService.bookmarks,
            run: () => this.refreshAsync()
        });
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        this.playListModel.loadData(XH.clubService.bookmarks);
    }
}
