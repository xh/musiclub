import {div, h1, h2, img, p, placeholder, table, tbody, td, tr} from '@xh/hoist/cmp/layout';
import {markdown} from '@xh/hoist/cmp/markdown';
import {creates, hoistCmp} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {compact, isEmpty, uniq} from 'lodash';
import {linkTags} from '../../cmp/LinkTags';
import {albumIcon, artistIcon} from '../../../core/Icons';
import {PlayModel} from './PlayModel';
import './Play.scss';

export const playView = hoistCmp.factory({
    displayName: 'PlayView',
    model: creates(PlayModel),
    className: 'mc-play-view mc-detail-view',

    render({model, playSlug, className}) {
        const {play} = model;
        if (!play) return placeholder(Icon.error(), `Unknown play [${playSlug}]`);

        return div({
            className,
            items: [
                div({
                    className: 'mc-detail-view__header',
                    items: [
                        h1(play.title),
                        h2(`${play.member} @ ${play.meetingName}`),
                        div({
                            className: 'mc-detail-view__header__notes',
                            item: markdown({content: play.notes}),
                            omit: !play.notes
                        })
                    ]
                }),
                statusWarning(),
                artistSection(),
                albumSection()
            ]
        });
    }
});

const statusWarning = hoistCmp.factory<PlayModel>(({model}) => {
    const {statusWarning: warning} = model;
    if (!warning) return null;

    return div({
        className: 'mc-detail-view__section mc-play-view__warning',
        items: [
            h2(Icon.warning(), 'ALERT'),
            p(warning),
            p(
                'If the year looks wrong or the album does not match, please do not panic. Surely the member did not made a mistake - try blaming the internet, or ask for help correcting.'
            )
        ]
    });
});

//------------------
// Artist
//------------------
const artistSection = hoistCmp.factory<PlayModel>(({model}) => {
    const {play, mbArtist} = model,
        json = mbArtist?.mbJson ?? {},
        area = json.area?.name,
        begin = extractYear(json['life-span']?.begin),
        end = extractYear(json['life-span']?.end);

    let lifeSpan = begin;
    if (lifeSpan && end) {
        lifeSpan += ` - ${end}`;
    }

    return div({
        className: 'mc-detail-view__section',
        items: [
            h2(artistIcon(), play.artist),
            p({
                omit: !area,
                items: [Icon.location(), area]
            }),
            p({
                omit: !lifeSpan,
                items: [Icon.calendar(), lifeSpan]
            }),
            linkTags({links: model.artistStreamingLinks}),
            linkTags({links: model.artistLinks})
        ]
    });
});

//------------------
// Album
//------------------
const albumSection = hoistCmp.factory<PlayModel>(({model}) => {
    const {play, releaseLinks, mbRelease, mbReleaseGroup} = model,
        groupJson = mbReleaseGroup?.mbJson ?? {},
        relJson = mbRelease?.mbJson ?? {},
        releaseDates = compact(
            uniq([extractYear(groupJson['first-release-date']), extractYear(relJson?.date)])
        ),
        releaseDate = !isEmpty(releaseDates) ? releaseDates.join(' / ') : null;

    return div({
        className: 'mc-detail-view__section',
        items: [
            h2(albumIcon(), play.album),
            p({
                omit: !releaseDate,
                items: [Icon.calendar(), releaseDate]
            }),
            coverImg(),
            trackList(),
            linkTags({links: releaseLinks})
        ]
    });
});

const coverImg = hoistCmp.factory<PlayModel>(({model}) => {
    const {play} = model;
    return play.coverArtUrl
        ? img({
              className: 'mc-play-view__cover',
              src: play.coverArtUrl
          })
        : null;
});

const trackList = hoistCmp.factory<PlayModel>(({model}) => {
    const {releaseTracks: tracks} = model;
    if (isEmpty(tracks)) return null;

    return table({
        className: 'mc-play-view__track-list',
        item: tbody(
            ...tracks.map(it =>
                tr({
                    className: it.isPlay ? 'mc-play-view__track-list__play' : null,
                    items: [td(it.position), td(it.title)]
                })
            )
        )
    });
});

const extractYear = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})/);
    return match ? match[1] : null;
};
