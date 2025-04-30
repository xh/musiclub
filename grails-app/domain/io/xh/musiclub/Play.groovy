package io.xh.musiclub


import io.xh.hoist.json.JSONFormat

import java.time.LocalDate

class Play implements JSONFormat {

    String slug
    String member

    // Provided/extracted values
    String artist
    String album
    String title

    // Resolved MusicBrainz IDs / Intl. Standard Recording Code
    String mbStatus
    String artistMbId
    String releaseGroupMbId
    String releaseMbId
    String recordingMbId
    String isrc

    String coverArtUrl
    String coverArtThumbUrl

    LocalDate releaseDate
    Boolean bonus
    String notes

    String getAlbumOrTitle() {
        return !album || album.equalsIgnoreCase('single') ? title : album
    }

    Map getMbEntities() {
        return [
            mbArtist      : artistMbId ? MbEntity.findByMbId(artistMbId) : null,
            mbReleaseGroup: releaseGroupMbId ? MbEntity.findByMbId(releaseGroupMbId) : null,
            mbRelease     : releaseMbId ? MbEntity.findByMbId(releaseMbId) : null,
            mbRecording   : recordingMbId ? MbEntity.findByMbId(recordingMbId) : null
        ]
    }

    static belongsTo = [meeting: Meeting]

    static constraints = {
        slug blank: false, maxSize: 20
        member nullable: true

        artist nullable: true
        album nullable: true
        title nullable: true

        mbStatus nullable: true
        artistMbId nullable: true, maxSize: 36
        releaseGroupMbId nullable: true, maxSize: 36
        releaseMbId nullable: true, maxSize: 36
        recordingMbId nullable: true, maxSize: 36
        isrc nullable: true, maxSize: 12

        coverArtUrl nullable: true
        coverArtThumbUrl nullable: true

        releaseDate nullable: true
        notes nullable: true, maxSize: 1500
    }

    static mapping = {
        cache true
    }

    Map formatForJSON() {
        [
            id              : id,
            slug            : slug,
            meeting         : meeting.id,
            meetingSlug     : meeting.slug,
            member          : member,
            artist          : artist,
            album           : album,
            title           : title,
            mbStatus        : mbStatus,
            artistMbId      : artistMbId,
            releaseGroupMbId: releaseGroupMbId,
            releaseMbId     : releaseMbId,
            recordingMbId   : recordingMbId,
            isrc            : isrc,
            coverArtUrl     : coverArtUrl,
            coverArtThumbUrl: coverArtThumbUrl,
            bonus           : bonus,
            notes           : notes
        ]
    }

}
