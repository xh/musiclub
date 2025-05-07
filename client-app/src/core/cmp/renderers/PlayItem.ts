import {div, h2, hbox, img, p} from '@xh/hoist/cmp/layout';
import {hoistCmp} from '@xh/hoist/core';
import {albumIcon, artistIcon, trackIcon} from '../../Icons';
import {ListItemProps, Play} from '../../Types';

export interface PlayItemProps extends ListItemProps {
    play: Play;
}

export const playItem = hoistCmp.factory<PlayItemProps>({
    displayName: 'PlayItem',
    className: 'mc-list__item mc-list__item--play',

    render({play, parentDim, isChild, className}) {
        if (!play) return null;

        const {coverArtThumbUrl, member, meetingName, title, artist, album} = play;

        return hbox({
            className: `${className} mc-list__item--${isChild ? 'child' : 'parent'} ${coverArtThumbUrl ? 'mc-list__item--play--with-cover-art' : ''}`,
            items: [
                div({
                    className: 'mc-list__item__data',
                    items: [
                        parentDim === 'meeting'
                            ? h2(member)
                            : parentDim === 'member'
                              ? h2(meetingName)
                              : h2(member, ' @ ', meetingName),
                        p(trackIcon(), title),
                        p(artistIcon(), artist),
                        p(albumIcon(), album)
                    ]
                }),
                img({
                    src: coverArtThumbUrl,
                    omit: !coverArtThumbUrl,
                    className: 'mc-list__item--play__cover-art',
                    alt: title
                })
            ]
        });
    }
});
