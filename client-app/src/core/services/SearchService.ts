import {HoistService, PlainObject, XH} from '@xh/hoist/core';
import {Document} from 'flexsearch';
// @ts-ignore
import en from 'flexsearch/lang/en';
import {isEmpty} from 'lodash';
import {Entity} from '../Types';

/**
 * Supports indexed searching of meetings, plays, and members via a FlexSearch index.
 * E.g. `XH.searchService.index.search('josh', {tag:{type:'member'}})`
 */
export class SearchService extends HoistService {
    index: Document;

    constructor() {
        super();

        this.index = new Document({
            document: {
                id: 'typeSlug',
                index: [
                    // These options are... obscure... 🤷
                    {field: 'exactText', tokenize: 'exact'},
                    {
                        field: 'searchText',
                        tokenize: 'forward',
                        encoder: en,
                        context: true
                    }
                ],
                tag: ['type']
            }
        });

        this.addReaction({
            track: () => XH.clubService.meetings,
            run: () => this.refreshIndexAsync(),
            fireImmediately: true
        });
    }

    async searchAsync(query: string): Promise<Entity[]> {
        const raw = (await this.index.searchAsync(query)) as PlainObject[];
        if (isEmpty(raw)) return [];

        const exactMatches = raw.find(it => it.field === 'exactText'),
            otherMatches = raw.find(it => it.field === 'searchText');

        console.log({exactMatches, otherMatches});

        const retSlugs = new Set<string>(),
            ret = [];

        [...(exactMatches?.result || []), ...(otherMatches?.result || [])].forEach(it => {
            if (!retSlugs.has(it)) {
                ret.push(this.toEntity(it));
                retSlugs.add(it);
            }
        });

        return ret;
    }

    //------------------
    // Implementation
    //------------------
    private toEntity(typeSlug: string): Entity {
        const [type, slug] = typeSlug.split('|');
        switch (type) {
            case 'meeting':
                return XH.clubService.getMeeting(slug);
            case 'play':
                return XH.clubService.getPlay(slug);
            case 'member':
                return XH.clubService.getMember(slug);
        }
    }

    private async refreshIndexAsync() {
        const {index} = this;
        let meetings = 0,
            plays = 0,
            members = 0;

        for (const m of XH.clubService.meetings) {
            await index.addAsync({
                typeSlug: `${m.type}|${m.slug}`,
                type: 'meeting',
                exactText: m.year,
                searchText: [m.slug, m.year, m.date, m.location].join(' | ')
            });
            meetings++;

            for (const p of m.plays) {
                await index.addAsync({
                    typeSlug: `${p.type}|${p.slug}`,
                    type: 'play',
                    searchText: [p.title, p.album, p.artist].join(' | ')
                });
                plays++;
            }
        }

        for (const m of XH.clubService.members) {
            await index.addAsync({
                typeSlug: `${m.type}|${m.slug}`,
                type: 'member',
                exactText: m.name,
                searchText: m.name
            });
            members++;
        }

        this.logInfo(
            `Indexing complete`,
            meetings + ' meetings',
            +plays + ' plays',
            +members + ' members'
        );
    }
}
