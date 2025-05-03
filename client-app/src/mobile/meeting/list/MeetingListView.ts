import {dataView} from '@xh/hoist/cmp/dataview';
import {filler} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {buttonGroupInput} from '@xh/hoist/mobile/cmp/input';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {titleBar} from '../../cmp/TitleBar';
import {MeetingListModel} from './MeetingListModel';

export const meetingListView = hoistCmp.factory({
    displayName: 'MeetingListView',
    className: 'mc-list',
    model: uses(() => MeetingListModel),

    render({model, className}) {
        const {sort, title, selectableDims} = model;

        return panel({
            className,
            tbar: titleBar({title}),
            item: dataView(),
            bbar: [
                filler(),
                buttonGroupInput({
                    bind: 'dim',
                    outlined: true,
                    items: [
                        ...selectableDims.map(({label, value}) =>
                            button({
                                text: label,
                                value
                            })
                        )
                    ]
                }),
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
