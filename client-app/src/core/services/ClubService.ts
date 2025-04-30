import {HoistService, LoadSpec, PlainObject, XH} from '@xh/hoist/core';
import {FieldSpec} from '@xh/hoist/data';
import {observable, runInAction} from '@xh/hoist/mobx';
import {LocalDate} from '@xh/hoist/utils/datetime';
import {Meeting, MeetingDim, MeetingGroup, Play, PlayWithMbEntities} from '../Types';

export class ClubService extends HoistService {
    @observable.ref meetings: Meeting[] = [];
    @observable.ref plays: Play[] = [];

    get playFields(): FieldSpec[] {
        return [
            {name: 'slug', type: 'string'},
            {name: 'member', type: 'string'},
            {name: 'artist', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'album', type: 'string'},
            {name: 'coverArtUrl', type: 'string'},
            {name: 'coverArtThumbUrl', type: 'string'},
            {name: 'bonus', type: 'bool'},
            {name: 'bonusDisplay', type: 'string'},
            {name: 'notes', type: 'string'}
        ];
    }

    getMeetingsBy(dim: MeetingDim): MeetingGroup[] {
        const map: {[key: string]: MeetingGroup} = {};
        this.meetings.forEach(mtg => {
            const val = mtg[dim];
            if (!map[val])
                map[val] = {
                    id: val,
                    title: val,
                    dimension: dim,
                    meetingCount: 0,
                    meetings: []
                };

            const grp = map[val];
            grp.meetingCount++;
            grp.meetings.push(mtg);
        });
        return Object.values(map);
    }

    getMeeting(slug: string): Meeting {
        return slug ? this.meetings.find(it => it.slug === slug) : null;
    }

    getPlay(slug: string): Play {
        return slug ? this.plays.find(it => it.slug === slug) : null;
    }

    async getPlayWithEntities(id: number, loadSpec?: LoadSpec): Promise<PlayWithMbEntities> {
        const resp = await XH.fetchJson({
            url: `plays/withEntities/${id}`,
            loadSpec
        });

        return {
            ...this.processRawPlay(resp.play),
            mbArtist: resp.mbArtist,
            mbReleaseGroup: resp.mbReleaseGroup,
            mbRelease: resp.mbRelease,
            mbRecording: resp.mbRecording
        };
    }

    override async initAsync(): Promise<void> {
        await super.initAsync();

        try {
            const raw = await XH.fetchJson({url: 'meetings'}),
                meetings: Meeting[] = [],
                plays: Play[] = [],
                rejected = [];

            raw.map(it => {
                try {
                    const mtg = this.processRawMeeting(it);
                    if (mtg.year) {
                        meetings.push(mtg);
                        plays.push(...mtg.plays);
                    } else {
                        rejected.push(mtg);
                    }
                } catch (e) {
                    this.logError('Error processing meeting', it, e);
                }
            });
            runInAction(() => {
                this.meetings = meetings;
                this.plays = plays;
            });
            this.logInfo(`Loaded ${meetings.length} meetings and ${plays.length} plays`);
            if (rejected.length) {
                this.logWarn(`Dropped ${rejected.length} meetings without a year`, rejected);
            }
        } catch (e) {
            XH.handleException(e, {title: 'Error loading Musiclub data'});
        }
    }

    //------------------
    // Implementation
    //------------------
    private processRawMeeting(raw: PlainObject): Meeting {
        const date = LocalDate.get(raw.date);
        return {
            id: raw.id,
            slug: raw.slug,
            date,
            dateYear: date ? parseInt(date.format('YYYY')) : null,
            year: raw.year,
            location: raw.location,
            notes: raw.notes,
            plays: raw.plays.map(it => this.processRawPlay(it))
        };
    }

    private processRawPlay(raw: PlainObject): Play {
        return {
            id: raw.id,
            slug: raw.slug,
            meetingSlug: raw.meetingSlug,
            member: raw.member ?? '[???]',
            artist: raw.artist ?? '[???]',
            title: raw.title ?? '[???]',
            album: raw.album ?? '[???]',
            coverArtUrl: raw.coverArtUrl,
            coverArtThumbUrl: raw.coverArtThumbUrl,
            bonus: raw.bonus,
            bonusDisplay: raw.bonus ? 'Bonus Round' : 'Main Picks',
            mbStatus: raw.mbStatus,
            notes: raw.notes
        };
    }
}
