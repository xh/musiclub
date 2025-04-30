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
    date: LocalDate;
    dateYear: number;
    year: string;
    location: string;
    notes: string;
    plays: Play[];
}

export type MeetingDim = 'year' | 'location' | 'meeting' | 'dateYear';

export interface MeetingGroup {
    id: string;
    title: string;
    dimension: MeetingDim;
    meetingCount: number;
    meetings: Meeting[];
}

export interface Play {
    id: number;
    slug: string;
    meetingSlug: string;
    member: string;
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

export interface PlayWithMbEntities extends Play {
    mbArtist: MbEntity | null;
    mbReleaseGroup: MbEntity | null;
    mbRelease: MbEntity | null;
    mbRecording: MbEntity | null;
}
