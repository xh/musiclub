import {HoistProps, PlainObject} from '@xh/hoist/core';
import {LocalDate} from '@xh/hoist/utils/datetime';

export type EntityType = 'meeting' | 'member' | 'play';
export type MbEntityType = 'artist' | 'releaseGroup' | 'release' | 'recording';
export type MbStatus = 'MATCHED' | 'MISMATCH' | 'PARTIALLY_MATCHED' | 'UNMATCHED';
export type MeetingDim = 'dateYear' | 'year' | 'location' | 'meeting';

//------------------
// Musiclub Entities
//------------------
/** Base interface for MC-sourced entities. */
export interface Entity {
    type: EntityType;
    slug: string;
}

export interface Member extends Entity {
    type: 'member';
    name: string;
    firstMeetingDate: LocalDate;
    meetings: Meeting[];
    meetingCount: number;
    plays: Play[];
    playCount: number;
    // TODO - linked user info, profile pic, bio/blurb
}

export interface Meeting extends Entity {
    type: 'meeting';
    id: number;
    name: string;
    date: LocalDate;
    dateYear: number;
    year: string;
    location: string;
    notes: string;
    plays: Play[];
}

/**
 * Grouped collection of meetings, queried for a particular dimension.
 * Can represent e.g. a location or a year.
 */
export interface MeetingGroup {
    id: string;
    title: string;
    dimension: MeetingDim;
    meetingCount: number;
    meetings: Meeting[];
}

export interface Play extends Entity {
    type: 'play';
    id: number;
    meetingId: number;
    meetingSlug: string;
    meetingName: string;
    meetingYear: number;
    meetingDate: LocalDate;
    // Will be placeholder text if no member
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

export interface PlayWithMbEntities extends Play {
    mbArtist: MbEntity | null;
    mbReleaseGroup: MbEntity | null;
    mbRelease: MbEntity | null;
    mbRecording: MbEntity | null;
}

export interface EntityLink {
    id: string;
    type: string;
    url: string;
}

//---------------------
// Other Interfaces
//---------------------
/** An entity loaded from Musicbrainz. */
export interface MbEntity {
    id: number;
    mbId: string;
    type: MbEntityType;
    mbJson: PlainObject;
}

export interface ListItemProps extends HoistProps {
    /** True if this item is rendered as an expanded child of a parent item. */
    isChild?: boolean;

    /**
     * If a child, the type (for parent entities) or dimension (for groups) of the parent row.
     * Can be used to customize the rendering of the entity as a child row.
     */
    parentDim?: EntityType | MeetingDim;
}
