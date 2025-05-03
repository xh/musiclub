import {creates, hoistCmp} from '@xh/hoist/core';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {clubIcon} from '../../core/Icons';
import {HomeTabModel} from './HomeTabModel';
import {p, placeholder} from '@xh/hoist/cmp/layout';

export const homeTab = hoistCmp.factory({
    model: creates(HomeTabModel),

    render() {
        return panel(
            placeholder(
                clubIcon(),
                p('Musiclüb is currently designed for your phone - go there to see all the music.'),
                p(
                    'Sorry if you hate your phone - maybe one day you will be able to leave it behind.'
                )
            )
        );
    }
});
