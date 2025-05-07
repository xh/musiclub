import {creates, hoistCmp} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {SearchListModel} from './SearchListModel';

export const searchList = hoistCmp.factory({
    displayName: 'SearchList',
    model: creates(SearchListModel),

    render() {
        return navigator();
    }
});
