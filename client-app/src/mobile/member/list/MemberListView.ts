import {dataView} from '@xh/hoist/cmp/dataview';
import {hoistCmp, uses} from '@xh/hoist/core';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {MemberListModel} from './MemberListModel';

export const memberListView = hoistCmp.factory({
    displayName: 'MemberListView',
    className: 'mc-list',
    model: uses(() => MemberListModel),

    render({model, className}) {
        return panel({
            className,
            item: dataView()
        });
    }
});
