import {creates, hoistCmp} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {MemberListModel} from './MemberListModel';

export const memberList = hoistCmp.factory({
    displayName: 'MemberList',
    model: creates(MemberListModel),

    render() {
        return navigator();
    }
});
