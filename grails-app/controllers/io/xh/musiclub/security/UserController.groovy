package io.xh.musiclub.security

import io.xh.hoist.admin.AdminRestController
import io.xh.hoist.security.Access

@Access(['HOIST_ADMIN'])
class UserController extends AdminRestController {

    static restTarget = User
    static trackChanges = true
}
