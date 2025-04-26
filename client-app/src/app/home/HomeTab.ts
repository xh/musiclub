import {creates, hoistCmp} from '@xh/hoist/core';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {clubIcon} from '../../core/Icons';
import {HomeTabModel} from './HomeTabModel';
import { placeholder } from '@xh/hoist/cmp/layout';

export const homeTab = hoistCmp.factory({
    model: creates(HomeTabModel),

    render() {
        return panel(placeholder(clubIcon()))
    }
});
