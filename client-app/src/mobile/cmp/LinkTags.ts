import {hbox} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {isEmpty} from 'lodash';
import './LinkTags.scss';
import {spotifyIcon, youTubeIcon} from '../../core/Icons';

export const linkTags = hoistCmp.factory({
    className: 'mc-link-tags',
    model: false,

    render({className, links, ...rest}) {
        if (isEmpty(links)) return null;

        return hbox({
            className,
            items: links.map(it => {
                let {type} = it,
                    icon = Icon.link(),
                    streaming = false;

                if (type === 'spotify') {
                    icon = spotifyIcon();
                    streaming = true;
                } else if (type === 'youtube') {
                    icon = youTubeIcon();
                    streaming = true;
                }

                return button({
                    text: it.type,
                    icon,
                    intent: streaming ? 'warning' : 'primary',
                    onClick: () => window.open(it.url, '_blank')
                });
            }),
            ...rest
        });
    }
});
