package io.xh.musiclub.admin

import io.xh.hoist.RestController
import io.xh.hoist.security.Access
import io.xh.musiclub.MbEntity
import io.xh.musiclub.Meeting
import io.xh.musiclub.Play

@Access(['MUSICLUB_ADMIN'])
class PlaysAdminController extends RestController {

    static restTarget = Play

    def musicBrainzService

    def enhance(Long id, Boolean ignoreCurrent, Integer minScore) {
        renderJSON(musicBrainzService.enhancePlay(id, ignoreCurrent, minScore))
    }

    def enhanceMany() {
        def req = parseRequestJSON(),
            ids = req.ids as List<Long>,
            ignoreCurrent = req.ignoreCurrent as boolean,
            minScore = (req.minScore ?: 90) as Integer

        renderJSON(musicBrainzService.enhancePlays(ids, ignoreCurrent, minScore))
    }

    def acceptMany() {
        def req = parseRequestJSON(),
            ids = req.ids as List<Long>

        renderJSON(musicBrainzService.acceptMbEntities(ids))
    }

    def markAsMismatch() {
        def req = parseRequestJSON(),
            ids = req.ids as List<Long>,
            keepArtist = req.keepArtist as boolean

        renderJSON(musicBrainzService.markAsMismatch(ids, keepArtist))
    }

    def addCoverArt() {
        def req = parseRequestJSON(),
            ids = req.ids as List<Long>
        renderJSON(musicBrainzService.addCoverArt(ids))
    }

    def lookupData() {
        renderJSON(
            members: members,
            meetings: Meeting.list().collect {
                [value: it.id, label: it.displayName]
            },
            artists: getLookup('artist'),
            releaseGroups: getLookup('releaseGroup'),
            releases: getLookup('release'),
            recordings: getLookup('recording'),
            mbStatuses: ['UNMATCHED', 'PARTIALLY_MATCHED', 'MATCHED', 'MISMATCH']
        )
    }

    protected void preprocessSubmit(Map submit) {
        if (submit.artistMbId) musicBrainzService.ensureArtistCreated(submit.artistMbId as String)
        if (submit.releaseGroupMbId) musicBrainzService.ensureReleaseGroupCreated(submit.releaseGroupMbId as String)
        if (submit.releaseMbId) musicBrainzService.ensureReleaseCreated(submit.releaseMbId as String)
        if (submit.recordingMbId) musicBrainzService.ensureRecordingCreated(submit.recordingMbId as String)
    }

    //------------------
    // Implementation
    //------------------
    private List<Map> getLookup(String entity) {
        def list = MbEntity.findAllByType(entity)
        return list.collect {
            [
                value: it.mbId,
                label: it.displayName
            ]
        }.sort { it.label }
    }

    private Set<String> getMembers() {
        return Play.list().collect { it.member }.toSet().sort()
    }

}
