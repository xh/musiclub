import {hoistCmp, uses} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {MemberListModel} from './MemberListModel';

export const memberList = hoistCmp.factory({
    displayName: 'MemberList',
    model: uses(MemberListModel),

    render({model}) {
        return navigator();
    }
});
