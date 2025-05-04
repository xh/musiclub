import {creates, hoistCmp} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {BookmarkListModel} from './BookmarkListModel';

export const bookmarkList = hoistCmp.factory({
    displayName: 'BookmarkList',
    model: creates(BookmarkListModel),

    render() {
        return navigator();
    }
});
