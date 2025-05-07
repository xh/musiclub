import {a, div, h2, li, p, span, strong, ul, vspacer} from '@xh/hoist/cmp/layout';
import {creates, hoistCmp, XH} from '@xh/hoist/core';
import {Icon, xhLogo} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {buttonGroupInput} from '@xh/hoist/mobile/cmp/input';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {addToHomescreenIcon, albumIcon} from '../../core/Icons';
import {AppModel} from '../AppModel';
import {titleBar} from '../cmp/TitleBar';
import './Settings.scss';
import {SettingsModel} from './SettingsModel';

export const settingsPanel = hoistCmp.factory({
    displayName: 'SettingsPanel',
    model: creates(SettingsModel),
    className: 'mc-settings-panel',

    render({model, className}) {
        const {pwaInstalled, pwaInstallAvailable, pwa} = model,
            installText = pwa
                ? pwaInstalled
                    ? 'Installed!'
                    : pwaInstallAvailable
                      ? 'Add to Home Screen'
                      : 'Install not supported'
                : 'Checking for install...';

        return panel({
            className,
            tbar: titleBar({title: 'Backstage'}),
            item: div({
                className: 'mc-settings-panel__content',
                items: [
                    buttonGroupInput({
                        value: XH.darkTheme,
                        outlined: true,
                        items: [
                            button({value: true, text: 'Goth', icon: Icon.moon(), width: '50%'}),
                            button({value: false, text: 'Pop', icon: Icon.sun(), width: '50%'})
                        ],
                        onChange: v => XH.toggleTheme()
                    }),
                    vspacer(),
                    button({
                        text: installText,
                        outlined: true,
                        intent: pwaInstallAvailable ? 'primary' : null,
                        icon: addToHomescreenIcon(),
                        disabled: !pwaInstallAvailable,
                        onClick: () => pwa.showDialog(true)
                    }),
                    div({
                        item: AppModel.instance.pwaInstallDescription,
                        className: `xh-font-size-small ${pwaInstallAvailable ? '' : 'xh-text-color-muted'}`
                    }),
                    vspacer(),
                    div({
                        className: 'mc-settings-panel__about',
                        items: [
                            h2('About Musiclüb'),
                            p('Musiclüb is a real club that meets monthly in Los Angeles, CA. 🌴'),
                            p(
                                'Each month a member hosts and selects a featured year, and each member brings a song from that year to play for the group.'
                            ),
                            ul(
                                li('Sometimes there are bonus songs ⭐️'),
                                li(
                                    'Bringing a song from the wrong year is a punishable offense 💀'
                                ),
                                li('Refreshments are provided 🍕')
                            ),
                            h2('Credits'),
                            p(
                                Icon.database(),
                                `Track/artist/album details provided by the open source `,
                                a({
                                    item: 'MusicBrainz Database',
                                    href: 'https://musicbrainz.org/',
                                    target: '_blank'
                                })
                            ),
                            p(
                                albumIcon(),
                                `Cover Art via the `,
                                a({
                                    item: 'Cover Art Archive',
                                    href: 'https://coverartarchive.org/',
                                    target: '_blank'
                                })
                            ),
                            p(Icon.edit(), 'Meticulous record-keeping by ', strong('John W.')),
                            div({
                                className: 'mc-settings-panel__about__xh-credit',
                                items: [
                                    `App by`,
                                    span({
                                        item: xhLogo(),
                                        onClick: () => window.open('https://xh.io', '_blank')
                                    })
                                ]
                            })
                        ]
                    }),
                    vspacer(),
                    button({
                        text: 'Tech Stuff',
                        outlined: true,
                        icon: Icon.code(),
                        onClick: () => XH.showAboutDialog()
                    }),
                    button({
                        text: 'Logout',
                        intent: 'danger',
                        icon: Icon.logout(),
                        onClick: () => XH.authModel.logoutAsync()
                    })
                ]
            })
        });
    }
});
