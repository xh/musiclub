package io.xh.musiclub.admin

import io.xh.hoist.RestController
import io.xh.hoist.security.Access
import io.xh.musiclub.Meeting
import io.xh.musiclub.MusicBrainzService

@Access(['MUSICLUB_ADMIN'])
class MeetingsAdminController extends RestController {

    static restTarget = Meeting

    MusicBrainzService musicBrainzService

    def enhance(Long id) {
        renderJSON(musicBrainzService.enhanceMeeting(id))
    }

}
