import {dataView} from '@xh/hoist/cmp/dataview';
import {filler} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {MeetingListModel} from './MeetingListModel';

export const meetingListView = hoistCmp.factory({
    displayName: 'MeetingListView',
    className: 'mc-list',
    model: uses(() => MeetingListModel),

    render({model, className}) {
        const {sort} = model;
        return panel({
            className,
            item: dataView(),
            bbar: [
                filler(),
                // filter field?
                button({
                    icon: sort == 'asc' ? Icon.chevronUp() : Icon.chevronDown({prefix: 'fal'}),
                    outlined: true,
                    onClick: () => model.toggleSort()
                }),
                filler()
            ]
        });
    }
});
