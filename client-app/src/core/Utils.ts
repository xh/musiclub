import {XH} from '@xh/hoist/core';
import {capitalize, isEmpty, sortBy} from 'lodash';
import {EntityLink, MbEntity} from './Types';

export function extractLinks(entity: MbEntity): EntityLink[] {
    if (isEmpty(entity?.mbJson?.relations)) return [];

    const supportedTypes = XH.getConf('supportedLinkTypes', [
        'discogs',
        'allmusic',
        'BBC Music Page',
        'amazon asin',
        'wikipedia'
    ]).map(it => it.toLowerCase());

    const dispTypes = {
        'amazon asin': 'Amazon'
    };

    const ret = entity.mbJson.relations
        .filter(
            it =>
                it['target-type'] === 'url' &&
                it.url?.resource &&
                supportedTypes.includes(it.type?.toLowerCase())
        )
        .map(it => {
            return {
                id: it.id,
                type: dispTypes[it.type] ?? capitalize(it.type),
                url: it.url.resource
            };
        });

    return sortBy(ret, 'type');
}

export function extractStreamingLinks(entity: MbEntity): EntityLink[] {
    if (isEmpty(entity?.mbJson?.relations)) return [];

    const ret = entity.mbJson.relations
        .filter(it => {
            const url = it.url?.resource ?? '';
            return (
                it['target-type'] === 'url' &&
                it.type?.includes('streaming') &&
                (url.includes('spotify.com') ||
                    url.includes('spotify.link') ||
                    url.includes('youtube.com') ||
                    url.includes('youtu.be'))
            );
        })
        .map(it => {
            const url = it.url.resource;
            return {
                id: it.id,
                type: url.includes('spotify') ? 'spotify' : 'youtube',
                url: it.url.resource
            };
        });

    return sortBy(ret, 'type');
}
