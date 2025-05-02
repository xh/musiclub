import {tabContainer} from '@xh/hoist/cmp/tab';
import {hoistCmp, uses, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {appBar} from '@xh/hoist/mobile/cmp/header';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {clubIcon} from '../core/Icons';
import {AppModel} from './AppModel';
import './App.scss';
import '../core/styles/Musiclub.scss';

export const AppComponent = hoistCmp({
    displayName: 'App',
    model: uses(AppModel),

    render() {
        return panel({
            tbar: appBar({
                omit: XH.isLandscape,
                icon: clubIcon({size: 'lg'}),
                hideRefreshButton: true,
                appMenuButtonProps: {
                    hideFeedbackItem: true,
                    hideThemeItem: true,
                    extraItems: [
                        {
                            text: XH.darkTheme ? 'Go Pop' : 'Go Goth',
                            icon: XH.darkTheme ? Icon.sun({prefix: 'fas'}) : Icon.moon(),
                            actionFn: () => XH.toggleTheme()
                        }
                    ]
                }
            }),
            item: tabContainer(),
            mask: 'onLoad'
        });
    }
});
