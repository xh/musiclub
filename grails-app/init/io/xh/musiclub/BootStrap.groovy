package io.xh.musiclub

import grails.gorm.transactions.Transactional
import io.xh.hoist.config.ConfigService
import io.xh.hoist.log.LogSupport
import io.xh.hoist.pref.PrefService
import io.xh.musiclub.security.RoleService
import io.xh.musiclub.security.User

import static io.xh.hoist.BaseService.parallelInit
import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig
import static io.xh.hoist.util.Utils.*

class BootStrap implements LogSupport {

    ConfigService configService
    PrefService prefService
    RoleService roleService

    def init = { servletContext ->
        logStartupMsg()

        ensureRequiredConfigsCreated()
        ensureRequiredPrefsCreated()
        ensureRequiredRolesCreated()

        createLocalAdminUserIfNeeded()

        def services = xhServices.findAll {
            it.class.canonicalName.startsWith(this.class.package.name)
        }
        parallelInit(services)
    }

    def destroy = {}

    //------------------------
    // Implementation
    //------------------------
    @Transactional
    private void createLocalAdminUserIfNeeded() {
        String adminUsername = getInstanceConfig('bootstrapAdminUser')
        String adminPassword = getInstanceConfig('bootstrapAdminPassword')
        if (adminUsername && adminPassword) {
            def user = User.findByEmail(adminUsername)
            if (!user) {
                new User(
                    email: adminUsername,
                    password: adminPassword,
                    name: 'Musiclüb Admin',
                    profilePicUrl: 'https://xh.io/images/toolbox-admin-profile-pic.png'
                ).save(flush: true)
            } else if (!user.checkPassword(adminPassword)) {
                user.password = adminPassword
                user.save(flush: true)
            }

            logInfo("Local admin user available as per instanceConfig", adminUsername)
        } else {
            logWarn("Default admin user not created. To provide admin access, specify credentials in a musiclub.yml instance config file.")
        }
    }

    private void logStartupMsg() {
        def buildLabel = appBuild != 'UNKNOWN' ? " [build $appBuild] " : " "

        logInfo("""
▗▖  ▗▖▗▖ ▗▖ ▗▄▄▖▗▄▄▄▖ ▗▄▄▖▗▖   ▗▖ ▗▖▗▄▄▖
▐▛▚▞▜▌▐▌ ▐▌▐▌     █  ▐▌   ▐▌   ▐▌ ▐▌▐▌ ▐▌
▐▌  ▐▌▐▌ ▐▌ ▝▀▚▖  █  ▐▌   ▐▌   ▐▌ ▐▌▐▛▀▚▖
▐▌  ▐▌▝▚▄▞▘▗▄▄▞▘▗▄█▄▖▝▚▄▄▖▐▙▄▄▖▝▚▄▞▘▐▙▄▞▘
         ${appName} v${appVersion}${buildLabel}${appEnvironment}
        """)
    }

    private void ensureRequiredConfigsCreated() {
        configService.ensureRequiredConfigsCreated([
            auth0Config: [
                groupName    : 'Musiclub',
                valueType    : 'json',
                defaultValue : [clientId: 'MUn9VrAGavF7n39RdhFYq8xkZkoFYEDB', domain: 'login.xh.io'],
                clientVisible: false,
                note         : 'OAuth config for the app registered at the XH Auth0 account.'
            ],
            jsLicenses : [
                groupName    : 'Musiclub',
                valueType    : 'json',
                defaultValue : [agGrid: null],
                clientVisible: true
            ]
        ])
    }

    private void ensureRequiredPrefsCreated() {
        prefService.ensureRequiredPrefsCreated([
            bookmarks: [
                type        : 'json',
                defaultValue: [],
                groupName   : 'Musiclub',
                note        : 'List of bookmarked play slugs.'
            ]
        ])
    }

    private void ensureRequiredRolesCreated() {
        roleService.ensureRequiredRolesCreated([
            [
                name    : 'MUSICLUB_ADMIN',
                category: 'Musiclub',
                roles   : ['HOIST_ADMIN']
            ]
        ])
    }
}
