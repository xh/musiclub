import {creates, hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {titleBar} from '../cmp/TitleBar';
import {playListView} from '../play/list/PlayListView';
import {BookmarkListModel} from './BookmarkListModel';
import {panel} from '@xh/hoist/mobile/cmp/panel';

export const bookmarkListView = hoistCmp.factory({
    displayName: 'BookmarkListView',
    className: 'mc-bookmark-list-view',
    model: creates(() => BookmarkListModel),

    render({model, className}) {
        return panel({
            className,
            tbar: titleBar({title: 'Bookmarks', icon: Icon.bookmark({size: 'lg', prefix: 'fat'})}),
            items: [playListView()]
        });
    }
});
