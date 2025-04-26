import {tabContainer} from '@xh/hoist/cmp/tab';
import {hoistCmp, uses, XH} from '@xh/hoist/core';
import {appBar} from '@xh/hoist/desktop/cmp/appbar';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {tabSwitcher} from '@xh/hoist/desktop/cmp/tab';
import {Icon} from '@xh/hoist/icon';
import {welcomeMsg} from '../core/cmp/WelcomeMsg';
import {clubIcon} from '../core/Icons';
import '../core/styles/Musiclub.scss';
import './App.scss';
import {AppModel} from './AppModel';

export const AppComponent = hoistCmp({
    displayName: 'App',
    model: uses(AppModel),

    render({model}) {
        return panel({
            tbar: appBar({
                icon: clubIcon({size: 'lg'}),
                hideRefreshButton: true,
                leftItems: [tabSwitcher({enableOverflow: true})],
                appMenuButtonProps: {
                    hideFeedbackItem: true,
                    hideThemeItem: true,
                    extraItems: [
                        welcomeMsg({multiline: true}),
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
