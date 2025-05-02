import {div, h1, h2, placeholder} from '@xh/hoist/cmp/layout';
import {markdown} from '@xh/hoist/cmp/markdown';
import {creates, hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {playListView} from '../../play/list/PlayListView';
import {MeetingModel} from './MeetingModel';

export const meetingView = hoistCmp.factory({
    displayName: 'MeetingView',
    model: creates(MeetingModel),
    className: 'mc-meeting-view mc-detail-view',

    render({model, meetingSlug, className}) {
        const {meeting: mtg} = model;
        if (!mtg) return placeholder(Icon.error(), `Unknown meeting [${meetingSlug}]`);

        return panel({
            className,
            items: [
                div({
                    className: 'mc-detail-view__header',
                    items: [
                        h1(mtg.name),
                        h2(mtg.location),
                        h2(mtg.date?.toString() ?? null),
                        div({
                            className: 'mc-detail-view__header__notes',
                            item: markdown({content: mtg.notes}),
                            omit: !mtg.notes
                        })
                    ]
                }),
                playListView()
            ]
        });
    }
});
