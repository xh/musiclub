package io.xh.musiclub

import io.xh.hoist.security.AccessAll

@AccessAll
class PlaysController extends BaseController {

    def index() {
        renderJSON(Play.list())
    }
}
