import {hoistCmp} from '@xh/hoist/core';
import {toolbar} from '@xh/hoist/mobile/cmp/toolbar';
import {clubIcon} from '../../core/Icons';
import './TitleBar.scss';
import {h1} from '@xh/hoist/cmp/layout';

export const titleBar = hoistCmp.factory({
    displayName: 'TitleBar',
    model: false,

    render({title, icon}) {
        return toolbar({
            className: 'mc-title-bar',
            items: [icon ?? clubIcon({size: 'lg', prefix: 'fat'}), h1(title)]
        });
    }
});
