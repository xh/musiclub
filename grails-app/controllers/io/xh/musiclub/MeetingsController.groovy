package io.xh.musiclub

import io.xh.hoist.security.AccessAll

@AccessAll
class MeetingsController extends BaseController {

    def index() {
        renderJSON(Meeting.list())
    }

}
