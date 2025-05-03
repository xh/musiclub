import {a, div, h2, p, span} from '@xh/hoist/cmp/layout';
import {hoistCmp, XH} from '@xh/hoist/core';
import {Icon, xhLogo} from '@xh/hoist/icon';
import {button} from '@xh/hoist/mobile/cmp/button';
import {buttonGroupInput} from '@xh/hoist/mobile/cmp/input';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {titleBar} from '../cmp/TitleBar';
import './Settings.scss';

export const settingsPanel = hoistCmp.factory({
    displayName: 'SettingsPanel',
    className: 'mc-settings-panel',

    render({className}) {
        return panel({
            className,
            tbar: titleBar({title: 'Backstage'}),
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
                }),
                div({
                    className: 'mc-settings-panel__about',
                    items: [
                        h2('About Musiclüb'),
                        p(
                            'Musiclüb meets monthly in Los Angeles, CA. Each month a member hosts and selects a featured year, and each member brings a song from that year to play for the group.'
                        ),
                        h2('Credits'),
                        p(
                            `Track/artist/album details provided by the open source `,
                            a({
                                item: 'MusicBrainz Database',
                                href: 'https://musicbrainz.org/',
                                target: '_blank'
                            })
                        ),
                        p(
                            `Cover Art via the `,
                            a({
                                item: 'Cover Art Archive',
                                href: 'https://coverartarchive.org/',
                                target: '_blank'
                            })
                        ),
                        p({
                            style: {textAlign: 'center'},
                            items: [
                                `App by`,
                                span({
                                    item: xhLogo(),
                                    onClick: () => window.open('https://xh.io', '_blank')
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
});
