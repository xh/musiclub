import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
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

        this.playListModel = new PlayListModel();

        this.addReaction({
            track: () => XH.clubService.bookmarks,
            run: () => this.refreshAsync()
        });
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        this.playListModel.loadData(XH.clubService.bookmarks);
    }
}
