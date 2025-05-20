package io.xh.musiclub

import grails.gorm.transactions.Transactional
import io.xh.hoist.config.ConfigService
import io.xh.hoist.log.LogSupport
import io.xh.hoist.pref.PrefService
import io.xh.musiclub.security.RoleService
import io.xh.musiclub.security.User

import java.time.format.DateTimeFormatter

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

        fixupSlugs()
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
                defaultValue : [
                    clientId: 'MUn9VrAGavF7n39RdhFYq8xkZkoFYEDB',
                    domain: 'login.xh.io',
                    authZeroClientOptions: [useCookiesForTransactions: false],
                    reloginEnabled: true
                ],
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

    // Temp routine to make Meeting and Play slugs more scalable.
    // Convert current idx order meeting slug to the ISO date of the meeting no dashes - so meeting 1 -> 20200412
    // Convert play slug from current [meeting-slug]-[playIdx] format to a) use new meeting slug
    // above and b) take play order from 1, 2, 3, 4... to 01, 02, 03, 04... so they sort OK
    // when under 99 plays (which is always)
    @Transactional
    private void fixupSlugs() {
        Meeting.list().each { meeting ->
            def newSlug = meeting.date.format(DateTimeFormatter.ofPattern('yyyyMMdd'))
            if (meeting.slug != newSlug) {
                logInfo("Updating meeting slug from ${meeting.slug} to $newSlug")
                meeting.slug = newSlug
                meeting.save(flush: true)
            }
        }

        Play.list().each { play ->
            def idxPart = play.slug.split('-')[1],
                newSlug = "${play.meeting.slug}-${idxPart.padLeft(2, '0')}"

            if (play.slug != newSlug) {
                logInfo("Updating play slug from ${play.slug} to $newSlug")
                play.slug = newSlug
                play.save(flush: true)
            }
        }
    }
}
