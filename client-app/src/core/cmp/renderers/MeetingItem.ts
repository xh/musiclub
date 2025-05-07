import {br, div, fragment, h1, h2, hbox, span} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {countTiles} from '../../../mobile/cmp/CountTiles';
import {ListItemProps, Meeting} from '../../Types';

export interface MeetingItemProps extends ListItemProps {
    meeting: Meeting;
}

export const meetingItem = hoistCmp.factory<MeetingItemProps>({
    displayName: 'MeetingItem',
    className: 'mc-list__item mc-list__item--meeting',

    render({meeting, isChild, parentDim, className}) {
        if (!meeting) return null;

        const {plays} = meeting,
            count = plays.filter(it => !it.bonus).length,
            bonusCount = plays.length - count;

        let title = `#${meeting.slug} - `,
            subtitle = null;
        if (parentDim === 'year') {
            title += meeting.date;
            subtitle = `${meeting.location}`;
        } else if (parentDim === 'location') {
            title += meeting.year;
            subtitle = `${meeting.date}`;
        } else {
            title += meeting.year;
            subtitle = fragment(meeting.date.toString(), br(), meeting.location);
        }

        return hbox({
            className: `${className} mc-list__item--${isChild ? 'child' : 'parent'}`,
            items: [
                div({
                    className: 'mc-list__item__data',
                    items: [h1(span(title)), h2(span(subtitle))]
                }),
                countTiles({count, bonusCount, big: false})
            ]
        });
    }
});
