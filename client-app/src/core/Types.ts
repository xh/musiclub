import {PlainObject} from '@xh/hoist/core';
import {LocalDate} from '@xh/hoist/utils/datetime';

export interface EntityLink {
    id: string;
    type: string;
    url: string;
}

export interface MbEntity {
    id: number;
    mbId: string;
    type: MbEntityType;
    mbJson: PlainObject;
}

export type MbEntityType = 'artist' | 'releaseGroup' | 'release' | 'recording';

export type MbStatus = 'MATCHED' | 'MISMATCH' | 'PARTIALLY_MATCHED' | 'UNMATCHED';

export interface Meeting {
    id: number;
    slug: string;
    name: string;
    date: LocalDate;
    dateYear: number;
    year: string;
    location: string;
    notes: string;
    plays: Play[];
}

export type MeetingDim = 'dateYear' | 'year' | 'location' | 'meeting';

export interface MeetingGroup {
    id: string;
    title: string;
    dimension: MeetingDim;
    meetingCount: number;
    meetings: Meeting[];
}

export interface Member {
    slug: string;
    name: string;
    firstMeetingDate: LocalDate;
    meetings: Meeting[];
    meetingCount: number;
    plays: Play[];
    playCount: number;
    // TODO - linked user info, profile pic, bio/blurb
}

export interface Play {
    id: number;
    slug: string;
    meetingId: number;
    meetingSlug: string;
    meetingName: string;
    meetingYear: number;
    meetingDate: LocalDate;
    // Will be placeholder if no member
    member: string;
    // Will be null if no member
    memberSlug: string;
    artist: string;
    title: string;
    album: string;
    coverArtUrl: string | null;
    coverArtThumbUrl: string | null;
    bonus: boolean;
    bonusDisplay: string;
    mbStatus: MbStatus;
    notes: string | null;
}

export type PlayDim = 'artist' | 'bonusDisplay' | 'meetingDate' | 'meetingYear' | 'member';

export interface PlayWithMbEntities extends Play {
    mbArtist: MbEntity | null;
    mbReleaseGroup: MbEntity | null;
    mbRelease: MbEntity | null;
    mbRecording: MbEntity | null;
}
