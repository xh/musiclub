import {div, h1, hbox, span} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {countTiles} from '../../../mobile/cmp/CountTiles';
import {ListItemProps, Member} from '../../Types';

export interface MemberItemProps extends ListItemProps {
    member: Member;
}

export const memberItem = hoistCmp.factory<MemberItemProps>({
    displayName: 'MemberItem',
    className: 'mc-list__item mc-list__item--member',

    render({member, isChild, className}) {
        if (!member) return null;

        const {name, meetingCount} = member;
        return hbox({
            className: `${className} mc-list__item--${isChild ? 'child' : 'parent'}`,
            items: [
                div({
                    className: 'mc-list__item__data',
                    items: [h1(span(name))]
                }),
                countTiles({
                    count: meetingCount
                })
            ]
        });
    }
});
