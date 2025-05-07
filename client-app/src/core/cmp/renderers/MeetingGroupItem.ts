import {div, h1, hbox, span} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {countTiles} from '../../../mobile/cmp/CountTiles';
import {ListItemProps, MeetingGroup} from '../../Types';

export interface MeetingGroupItemProps extends ListItemProps {
    meetingGroup: MeetingGroup;
}

export const meetingGroupItem = hoistCmp.factory<MeetingGroupItemProps>({
    displayName: 'MeetingGroupItem',
    className: 'mc-list__item mc-list__item--meeting-group',

    render({meetingGroup, isChild, className}) {
        const {title, meetingCount, dimension} = meetingGroup;

        return hbox({
            className: `${className} mc-list__item--${isChild ? 'child' : 'parent'} mc-list__item--${dimension}`,
            items: [
                div({
                    className: 'mc-list__item__data',
                    items: [h1(span(title))]
                }),
                countTiles({count: meetingCount, big: true})
            ]
        });
    }
});
