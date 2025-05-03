import {dataView} from '@xh/hoist/cmp/dataview';
import {filler} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {titleBar} from '../../cmp/TitleBar';
import {MeetingListModel} from './MeetingListModel';
import {checkboxButton} from '@xh/hoist/mobile/cmp/input';

export const meetingListView = hoistCmp.factory({
    displayName: 'MeetingListView',
    className: 'mc-list',
    model: uses(() => MeetingListModel),

    render({model, className}) {
        const {sort, title, dim, selectableDims} = model;

        // TODO - decide if we want to support multiple dims
        let dimChooser = null;
        if (model.selectableDims.length === 1) {
            dimChooser = checkboxButton({
                text: `By ${selectableDims[0]}`,
                value: dim === selectableDims[0],
                onChange: useDim => {
                    model.dim = useDim ? selectableDims[0] : null;
                }
            });
        }

        return panel({
            className,
            tbar: titleBar({title}),
            item: dataView(),
            bbar: [
                filler(),
                // filter field?
                dimChooser,
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
