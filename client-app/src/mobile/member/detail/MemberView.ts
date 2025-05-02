import {div, h1, h2, placeholder} from '@xh/hoist/cmp/layout';
import {creates, hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {playListView} from '../../play/list/PlayListView';
import {MemberModel} from './MemberModel';
import './Member.scss';

export const memberView = hoistCmp.factory({
    displayName: 'MemberView',
    model: creates(MemberModel),
    className: 'mc-member-view mc-detail-view',

    render({model, memberSlug, className}) {
        const {member} = model;
        if (!member) return placeholder(Icon.error(), `Unknown member [${memberSlug}]`);

        return panel({
            className,
            items: [
                div({
                    className: 'mc-detail-view__header',
                    items: [h1(member.name), h2(`Joined ${member.firstMeetingDate}`)]
                }),
                playListView()
            ]
        });
    }
});
