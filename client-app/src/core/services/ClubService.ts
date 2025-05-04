import {HoistService, LoadSpec, PlainObject, XH} from '@xh/hoist/core';
import {FieldSpec} from '@xh/hoist/data';
import {action, makeObservable, observable, runInAction} from '@xh/hoist/mobx';
import {LocalDate} from '@xh/hoist/utils/datetime';
import {fromPairs, kebabCase, sortBy, values} from 'lodash';
import {Meeting, MeetingDim, MeetingGroup, Member, Play, PlayWithMbEntities} from '../Types';

export class ClubService extends HoistService {
    @observable.ref meetings: Meeting[] = [];
    @observable.ref members: Member[] = [];

    @observable.ref plays: Play[] = [];
    @observable.ref playsBySlug: Map<string, Play> = new Map();

    @observable.ref
    bookmarkSlugs: string[] = XH.getPref('bookmarks');

    get bookmarks(): Play[] {
        return this.bookmarkSlugs.map(it => this.getPlay(it)).filter(it => it);
    }

    get playFields(): FieldSpec[] {
        return [
            {name: 'slug', type: 'string'},
            {name: 'meetingId', type: 'number'},
            {name: 'meetingSlug', type: 'string'},
            {name: 'meetingName', type: 'string'},
            {name: 'meetingYear', type: 'string'},
            {name: 'meetingDate', type: 'localDate'},
            {name: 'member', type: 'string'},
            {name: 'memberSlug', type: 'string'},
            {name: 'artist', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'album', type: 'string'},
            {name: 'coverArtUrl', type: 'string'},
            {name: 'coverArtThumbUrl', type: 'string'},
            {name: 'bonus', type: 'bool'},
            {name: 'bonusDisplay', type: 'string'},
            {name: 'mbStatus', type: 'string'},
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
        return slug ? this.playsBySlug.get(slug) : null;
    }

    getMember(slug: string): Member {
        return slug ? this.members.find(it => it.slug === slug) : null;
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

    isBookmarked(play: Play): boolean {
        return this.bookmarkSlugs.includes(play.slug);
    }

    toggleBookmark(play: Play) {
        this.isBookmarked(play) ? this.removeBookmark(play) : this.addBookmark(play);
        console.log('play is now bookmarked?', this.isBookmarked(play));
    }

    @action
    addBookmark(play: Play) {
        if (!this.bookmarkSlugs.includes(play.slug)) {
            this.bookmarkSlugs = [...this.bookmarkSlugs, play.slug].sort();
            XH.setPref('bookmarks', this.bookmarkSlugs);
        }
    }

    @action
    removeBookmark(play: Play) {
        this.bookmarkSlugs = this.bookmarkSlugs.filter(it => it !== play.slug);
        XH.setPref('bookmarks', this.bookmarkSlugs);
    }

    constructor() {
        super();
        makeObservable(this);
    }

    override async initAsync(): Promise<void> {
        await super.initAsync();

        try {
            const raw = await XH.fetchJson({url: 'meetings'});
            let meetings: Meeting[] = [],
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

            meetings = sortBy(meetings, 'date');
            plays = sortBy(plays, ['meetingDate', 'slug']);

            // Extract members from plays
            const meetingsById = fromPairs(meetings.map(it => [it.id, it])),
                membersBySlug: Record<string, Member> = {};

            plays.forEach(play => {
                const {memberSlug, member: name} = play;
                if (!memberSlug) return;

                if (!membersBySlug[memberSlug]) {
                    membersBySlug[memberSlug] = {
                        slug: memberSlug,
                        name,
                        firstMeetingDate: play.meetingDate,
                        meetings: [],
                        meetingCount: 0,
                        plays: [],
                        playCount: 0
                    };
                }
                const member = membersBySlug[memberSlug],
                    meeting = meetingsById[play.meetingId];

                if (!member.meetings.includes(meeting)) {
                    member.meetings.push(meeting);
                    member.meetingCount++;
                }
                member.plays.push(play);
                member.playCount++;
            });

            const playsBySlug = new Map<string, Play>();
            plays.forEach(play => playsBySlug.set(play.slug, play));

            // Flush into caches
            runInAction(() => {
                this.meetings = meetings;
                this.plays = plays;
                this.playsBySlug = playsBySlug;
                this.members = values(membersBySlug);
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
            name: `#${raw.slug} - ${raw.year}`,
            date,
            dateYear: date ? parseInt(date.format('YYYY')) : null,
            year: raw.year,
            location: raw.location,
            notes: raw.notes,
            plays: raw.plays.map(it => this.processRawPlay(it))
        };
    }

    private processRawPlay(raw: PlainObject): Play {
        const {meeting} = raw;
        return {
            id: raw.id,
            slug: raw.slug,

            meetingId: meeting.id,
            meetingSlug: meeting.slug,
            meetingName: `#${meeting.slug} - ${meeting.year}`,
            meetingYear: meeting.year,
            meetingDate: LocalDate.get(meeting.date),

            member: raw.member ?? (raw.bonus ? 'Bonus' : '???'),
            memberSlug: raw.member ? kebabCase(raw.member) : null,
            artist: raw.artist ?? '???',
            title: raw.title ?? '???',
            album: raw.album ?? '???',
            coverArtUrl: raw.coverArtUrl,
            coverArtThumbUrl: raw.coverArtThumbUrl,

            bonus: raw.bonus,
            bonusDisplay: raw.bonus ? 'Bonus Round' : 'Main Picks',
            mbStatus: raw.mbStatus,
            notes: raw.notes
        };
    }
}
