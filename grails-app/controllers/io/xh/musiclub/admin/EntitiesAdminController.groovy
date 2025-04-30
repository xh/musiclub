package io.xh.musiclub.admin

import grails.validation.ValidationException
import io.xh.hoist.RestController
import io.xh.hoist.security.Access
import io.xh.musiclub.MbEntity
import io.xh.musiclub.MusicBrainzService

@Access(['MUSICLUB_ADMIN'])
class EntitiesAdminController extends RestController {

    static restTarget = MbEntity

    MusicBrainzService musicBrainzService

    def create() {
        MbEntity.withTransaction {
            def data = parseRequestJSON().data
            preprocessSubmit(data)

            def obj = MbEntity.newInstance(data)
            doCreate(obj, data)
            noteChange(obj, 'CREATE')
            renderJSON(data: obj.formatForAdminJSON())
        }
    }

    def read() {
        MbEntity.withTransaction {
            def ret = params.id ? [MbEntity.get(params.id)] : MbEntity.list()
            renderJSON(data: ret*.formatForAdminJSON())
        }
    }

    def update() {
        MbEntity.withTransaction {
            def data = parseRequestJSON().data
            preprocessSubmit(data)

            def obj = MbEntity.get(data.id)
            try {
                doUpdate(obj, data)
                noteChange(obj, 'UPDATE')
                renderJSON(data: obj.formatForAdminJSON())
            } catch (ValidationException ex) {
                obj.discard()
                throw ex
            }
        }
    }

    def refreshMany() {
        def req = parseRequestJSON(),
            ids = req.ids as List<Long>

        renderJSON(musicBrainzService.refreshMbEntities(ids))
    }

}
