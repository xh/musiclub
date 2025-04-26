package io.xh.musiclub

import io.xh.hoist.config.ConfigService
import io.xh.hoist.monitor.provided.DefaultMonitorDefinitionService

class MonitorDefinitionService extends DefaultMonitorDefinitionService {

    ConfigService configService

    @Override
    void init() {
        super.init()
        ensureRequiredMonitorsCreated([])
    }

}
