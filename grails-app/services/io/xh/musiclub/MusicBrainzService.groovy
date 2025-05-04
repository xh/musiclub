package io.xh.musiclub

import grails.compiler.GrailsCompileStatic
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.NamedParam
import groovy.transform.NamedVariant
import io.xh.hoist.BaseService
import io.xh.hoist.config.ConfigService
import io.xh.hoist.http.JSONClient
import io.xh.hoist.json.JSONSerializer
import org.apache.hc.client5.http.classic.methods.HttpGet
import org.apache.hc.core5.net.URIBuilder


@GrailsCompileStatic
class MusicBrainzService extends BaseService {

    ConfigService configService

    private JSONClient _client

    Map<Long, ResResults> enhanceMeeting(Long id, boolean ignoreCurrent) {
        def mtg = Meeting.get(id)
        if (!mtg) throw new RuntimeException("No meeting found with ID $id")

        withInfo(["Enhancing meeting ${mtg.slug}", mtg.year, mtg.location, "${mtg.plays.size()} plays"]) {
            enhancePlays(mtg.plays*.id, ignoreCurrent)
        }
    }

    Map<Long, ResResults> enhancePlays(List<Long> ids, boolean ignoreCurrent, Integer minScore = 90) {
        Map<Long, ResResults> ret = [:]
        ids.each { id ->
            try {
                def res = enhancePlay(id, ignoreCurrent, minScore)
                ret[id] = res
            } catch (e) {
                logError("Error enhancing play ID $id", e)
                ret[id] = new ResResults(play: Play.get(id), error: e.message)
            }
        }
        return ret
    }

    /**
     * 0) Use artistName to find artist.
     * 1) Use [album name, artist mbId, meeting year] to find release-group.
     *    http://localhost:5000/ws/2/release-group/?fmt=json&query=release:unrest%20AND%20arid:6ba2f6ce-50be-47df-b5a3-298ef032f476%20AND%20firstreleasedate:1974
     * 2) Use [rgId, meeting year] to find release - could also do status:Official.
     *    http://localhost:5000/ws/2/release/?fmt=json&query=rgid:d1fac684-703d-3fed-90f6-24ef55aca4ae%20AND%20date:1974
     * 2a) Browse release-group, including releases.
     *    http://localhost:5000/ws/2/release-group/d1fac684-703d-3fed-90f6-24ef55aca4ae?fmt=json&inc=releases
     * 3) Use [releaseId, track title] to find recording.
     *    http://localhost:5000/ws/2/recording/?fmt=json&query=reid:ad485e54-8780-4a66-9429-14dbdee258c5%20AND%20recording:Bittern%20Storm%20Over%20Ulm
     * 3a) Browse release, including recordings.
     *    http://localhost:5000/ws/2/release/ad485e54-8780-4a66-9429-14dbdee258c5?fmt=json&inc=recordings
     * 4) TODO: Browse recording, including ISRCs.
     *    http://localhost:5000/ws/2/recording/b37797ec-f3cc-4797-a229-9826d49f939e?fmt=json&inc=isrcs
     */
    @Transactional
    ResResults enhancePlay(Long id, boolean ignoreCurrent, Integer minScore = 90) {
        def play = Play.get(id)

        if (!play) {
            return new ResResults(
                play: play,
                error: "No play found with ID $id"
            )
        }

        def artistResults = resolveArtist(play, ignoreCurrent, minScore)
        if (artistResults.error) return artistResults

        def releaseGroupResults = resolveReleaseGroup(play, ignoreCurrent, minScore).withPriorResults(artistResults)
        if (releaseGroupResults.error) return releaseGroupResults

        def releaseResults = resolveRelease(play, ignoreCurrent, minScore).withPriorResults(releaseGroupResults)
        if (releaseResults.error) return releaseResults

        return resolveRecording(play, ignoreCurrent, minScore).withPriorResults(releaseResults)
    }


    //------------------
    // Match acceptance / clearing
    //------------------
    @Transactional
    void markAsMismatch(List<Long> playIds, Boolean keepArtist) {
        playIds.each {
            def play = Play.get(it)
            play.mbStatus = 'MISMATCH'

            if (!keepArtist) play.artistMbId = null
            play.releaseGroupMbId = null
            play.releaseMbId = null
            play.recordingMbId = null

            play.save()
        }
    }

    @Transactional
    List<Map> acceptMbEntities(List<Long> playIds) {
        List<Map> ret = []
        playIds.each {
            def play = Play.get(it),
                accepted = [],
                error = null

            if (play.mbStatus == 'MISMATCH') {
                error = "mbStatus is MISMATCH - skipped"
                logWarn([playId: it, _msg: error])
                ret << [play: play, error: error]
                return
            }

            ['artist', 'release', 'recording'].each { entityType ->
                if (error) return

                def result = acceptMbEntity(play, entityType)
                if (result.error) {
                    logWarn([playId: it, _msg: result.error])
                    error = result.error
                } else {
                    logInfo([playId: it, _msg: "Accepted $entityType:${result.entityName}"])
                    accepted << entityType
                }
            }

            if (!accepted) {
                play.mbStatus = 'UNMATCHED'
            } else if (error) {
                play.mbStatus = 'PARTIALLY_MATCHED'
            } else {
                play.mbStatus = 'MATCHED'
            }
            play.save()

            ret << [play: play, accepted: accepted, error: error]
        }

        return ret
    }

    @Transactional
    List<Play> addCoverArt(List<Long> ids) {
        return ids.collect {addCoverArt(it)}
    }

    @Transactional
    Play addCoverArt(Long playId) {
        withInfo("Adding cover art for play $playId") {
            def play = Play.get(playId),
                foundArt = false

            if (play.releaseMbId) {
                def urls = getCoverArt(play.releaseMbId, 'release')
                if (urls.coverArtUrl) {
                    play.coverArtUrl = urls.coverArtUrl
                    play.coverArtThumbUrl = urls.coverArtThumbUrl
                    foundArt = true
                }
            }

            if (!foundArt && play.releaseGroupMbId) {
                def urls = getCoverArt(play.releaseGroupMbId, 'release-group')
                if (urls.coverArtUrl) {
                    play.coverArtUrl = urls.coverArtUrl
                    play.coverArtThumbUrl = urls.coverArtThumbUrl
                    foundArt = true
                }
            }

            if (foundArt) play.save(flush: true)
            return play
        }
    }

    //------------------
    // Entity Mgmt
    //------------------
    @Transactional Map refreshMbEntities(List<Long> entityIds) {
        List<Long> refreshed = []
        Map<Long, String> errors = [:]

        entityIds.each {id ->
            try {
                def mbEntity = MbEntity.get(id)
                if (mbEntity) {
                    refreshed.add(refreshMbEntity(mbEntity).id)
                } else {
                    logWarn("No MB entity found with ID $id")
                    errors[id] = "Not found"
                }
            } catch (e) {
                logError("Error refreshing MB entity ID $id", e)
                errors[id] = e.message
            }
        }
        return [refreshed: refreshed, errors: errors]
    }

    @Transactional
    MbEntity refreshMbEntity(MbEntity mbEntity) {
        Map raw = getRawEntityData(mbEntity.mbId, mbEntity.type)
        String name = raw[mbEntity.type == 'artist' ? 'name' : 'title']
        mbEntity.name = name
        mbEntity.mbJson = JSONSerializer.serialize(raw)
        mbEntity.save(flush: true)
        logInfo("Refreshed ${mbEntity.type}:${mbEntity.mbId}", name)
        mbEntity
    }

    @Transactional
    ensureArtistCreated(String mbId) {
        getOrFetchAndCreateMbEntity(mbId, 'artist')
    }

    @Transactional
    ensureReleaseGroupCreated(String mbId) {
        getOrFetchAndCreateMbEntity(mbId, 'releaseGroup')
    }

    @Transactional
    ensureReleaseCreated(String mbId) {
        getOrFetchAndCreateMbEntity(mbId, 'release')
    }

    @Transactional
    ensureRecordingCreated(String mbId) {
        getOrFetchAndCreateMbEntity(mbId, 'recording')
    }


    //------------------
    // Implementation
    //------------------
    @Transactional
    private ResResults resolveArtist(Play play, boolean ignoreCurrent, Integer minScore) {
        resolveEntity(
            play: play,
            entityType: 'artist',
            requiredProps: ['artist'],
            queryBuilder: { Play p -> "artist:${p.artist}" },
            minScore: minScore,
            ignoreCurrent: ignoreCurrent
        )
    }

    @Transactional
    private ResResults resolveReleaseGroup(Play play, boolean ignoreCurrent, Integer minScore) {
        def ret = resolveEntity(
            play: play,
            entityType: 'releaseGroup',
            requiredProps: ['albumOrTitle', 'artistMbId'],
            queryBuilder: { Play p ->
                "release:${p.albumOrTitle} AND arid:${p.artistMbId} AND firstreleasedate:${p.meeting.year}"
            },
            fallbackQueries: [
                { Play p -> "release:${p.albumOrTitle} AND arid:${p.artistMbId}" },
                { Play p -> "release:${p.albumOrTitle} AND artist:${p.artist}" }
            ],
            minScore: minScore,
            ignoreCurrent: ignoreCurrent
        )

        if (ret.mbEntity && !play.coverArtUrl) {
            addCoverArt(play.id)
        }

        return ret
    }

    @Transactional
    private ResResults resolveRelease(Play play, boolean ignoreCurrent, Integer minScore) {
        def ret = resolveEntity(
            play: play,
            entityType: 'release',
            requiredProps: ['releaseGroupMbId'],
            queryBuilder: { Play p -> "rgid:${p.releaseGroupMbId} AND date:${p.meeting.year}" },
            fallbackQueries: [
                { Play p -> "rgid:${p.releaseGroupMbId}" }
            ],
            minScore: minScore,
            ignoreCurrent: ignoreCurrent
        )


        if (ret.mbEntity && !play.coverArtUrl) {
            addCoverArt(play.id)
        }

        return ret
    }

    @Transactional
    private ResResults resolveRecording(Play play, boolean ignoreCurrent, Integer minScore) {
        resolveEntity(
            play: play,
            entityType: 'recording',
            requiredProps: ['releaseMbId', 'title'],
            queryBuilder: { Play p -> "reid:${p.releaseMbId} AND recording:${p.title}" },
            minScore: minScore,
            ignoreCurrent: ignoreCurrent
        )
    }

    @CompileDynamic
    @Transactional
    private Map getCoverArt(String mbId, String entityType) {
        try {
            def get = new HttpGet("https://coverartarchive.org/$entityType/${mbId}"),
                resp = client.executeAsMap(get)

            if (resp.images) {
                // Look for the best front image
                def img = resp.images.find { it.front && it.approved }
                if (!img) img = resp.images.find { it.front }
                if (img) {
                    logInfo("Cover art found for $entityType $mbId")
                    return [
                        coverArtUrl     : img.image,
                        coverArtThumbUrl: img.thumbnails?.large ?: img.thumbnails?.small ?: img.image
                    ]
                } else {
                    logInfo("No cover art found for $entityType $mbId")
                    return [coverArtUrl: null, coverArtThumbUrl: null]
                }
            }
        } catch (e) {
            logWarn("Error fetching cover art for $entityType $mbId", e)
            return [coverArtUrl: null, coverArtThumbUrl: null]
        }
    }

    @NamedVariant
    private ResResults resolveEntity(
        @NamedParam Play play,
        @NamedParam String entityType,
        @NamedParam Collection<String> requiredProps,
        @NamedParam Closure queryBuilder,
        @NamedParam List<Closure> fallbackQueries,
        @NamedParam Integer minScore,
        @NamedParam boolean ignoreCurrent = false
    ) {
        withInfo(["Resolving $entityType", [playId: play.id]]) {
            ResResults ret = new ResResults(entityType: entityType, play: play)

            def missingProps = requiredProps.findAll { play[it] == null }
            if (missingProps) {
                return ret.withError("Missing required properties: ${missingProps.join(', ')}")
            }

            def mbIdProp = "${entityType}MbId",
                currMbId = play[mbIdProp] as String

            if (currMbId && !ignoreCurrent) {
                def mbEntity = MbEntity.findByMbId(currMbId)
                if (mbEntity) {
                    return ret.withEntity(mbEntity)
                } else {
                    logWarn("Play $mbIdProp $currMbId set but entity not found - will attempt to lookup")
                }
            }

            def query = queryBuilder(play)
            ret.query = query

            def apiEndpointPath = entityType == 'releaseGroup' ? 'release-group' : entityType,
                apiResponsePath = "${apiEndpointPath}s",
                uri = buildUri(apiEndpointPath, [query: query]),
                results = client.executeAsMap(new HttpGet(uri))

            ret = withMatches(ret, results[apiResponsePath] as List, minScore)

            if (ret.error && fallbackQueries) {
                fallbackQueries.eachWithIndex { f, idx ->
                    if (!ret.error) return // prior fallback might have worked

                    logWarn("No $entityType found for play ${play.id} so far - trying fallback query ${idx}")
                    query = f(play)
                    ret.query = query
                    ret.isFallback = true

                    uri = buildUri(apiEndpointPath, [query: query])
                    results = client.executeAsMap(new HttpGet(uri))
                    ret = withMatches(ret, results[apiResponsePath] as List, minScore)
                }
            }

            return ret
        }
    }

    private ResResults withMatches(ResResults results, List<Map> rawMatches, int minScore) {
        def matches = evalMatches(rawMatches, results.entityType, minScore)

        results.matchResults = matches
        results.mbEntity = matches.mbEntity
        results.error = matches.error

        if (matches.mbId) {
            results.play["${results.entityType}MbId"] = matches.mbId
            results.play.save()
        }

        results
    }

    private MatchResults evalMatches(List<Map> matches, String entityType, int minScore) {
        def ret = new MatchResults()

        if (!matches) {
            ret.error = 'No matches found'
        } else {
            ret.possibleMatches = matches.take(5)

            def bestMatch = matches.first(),
                bestScore = bestMatch.score as Integer,
            // Count as tie if within two points ("Phoenix" artist search)
                ties = matches.findAll { (it.score as Integer) >= (bestScore - 2) },
                tiedMatch = ties.size() > 1

            // Favor groups over people for artist matches
            if (tiedMatch && entityType == 'artist') {
                bestMatch = ties.find { it['type'] == 'Group' } ?: bestMatch
            }

            // Favor albums over singles for releaseGroup matches
            if (tiedMatch && entityType == 'releaseGroup') {
                bestMatch = ties.find { it['primary-type'] == 'Album' } ?: bestMatch
            }

            if (bestScore >= minScore) {
                if (tiedMatch) {
                    ret.notes = "Multiple matches found with same top score $bestScore - taking first one"
                    ret.mbEntity = getOrCreateMbEntity(bestMatch, entityType)
                } else {
                    ret.mbEntity = getOrCreateMbEntity(bestMatch, entityType)
                }
            } else {
                ret.error = "No good match found - best score ${bestScore}"
            }
        }

        return ret
    }

    @Transactional
    private MbEntity getOrFetchAndCreateMbEntity(String mbId, String entityType) {
        def mbEntity = MbEntity.findByMbId(mbId)
        if (!mbEntity) {
            try {
                withInfo("No $entityType found with MBID $mbId - looking up and creating new record") {
                    Map raw = getRawEntityData(mbId, entityType)
                    String name = raw[entityType == 'artist' ? 'name' : 'title']
                    mbEntity = new MbEntity(
                        type: entityType,
                        name: name,
                        mbId: mbId,
                        mbJson: JSONSerializer.serialize(raw)
                    ).save(flush: true)
                }
            } catch (Exception e) {
                logError("Error fetching $entityType with MBID $mbId", e)
            }
        }
        return mbEntity
    }

    // Create a MbEntity if needed from raw data that's already been acquired - eg from a search hit.
    // TODO - review if we can get all the inc data from the search hit path vs direct fetch
    @Transactional
    private MbEntity getOrCreateMbEntity(Map raw, String type) {
        String id = raw.id
        String name = raw[type == 'artist' ? 'name' : 'title']
        MbEntity ret = MbEntity.findByMbId(id)

        if (!ret) {
            logInfo("No $type found with MBID $id - creating new record now for $name")
            ret = new MbEntity(
                type: type,
                name: name,
                mbId: id,
                mbJson: JSONSerializer.serialize(raw)
            ).save(flush: true)
        }

        return ret
    }

    private Map getRawEntityData(String mbId, String entityType) {
        def mbType = entityType == 'releaseGroup' ? 'release-group' : entityType,
            includes = getIncludes(entityType),
            uri = buildUri("$mbType/$mbId", includes ? [inc: includes.join('+')] : null),
            ret = client.executeAsMap(new HttpGet(uri))

        if (ret.error) throw new RuntimeException("Error fetching $mbId from MB: ${ret.error}")
        return ret
    }

    private List<String> getIncludes(String entityType) {
        if (entityType == 'artist') return ['release-groups', 'artist-rels', 'url-rels']
        if (entityType == 'release-group') return ['releases', 'url-rels']
        if (entityType == 'release') return ['artists', 'recordings', 'isrcs', 'url-rels']
        if (entityType == 'recording') return ['artists', 'isrcs', 'url-rels']
        return []
    }

    @Transactional
    private Map acceptMbEntity(Play play, String entityType) {
        def mbIdField = "${entityType}MbId",
            playField

        switch (entityType) {
            case 'artist':
                playField = 'artist'
                break
            case 'release':
                playField = 'album'
                break
            case 'recording':
                playField = 'title'
                break
            default:
                throw new RuntimeException("Unknown entity type $entityType")
        }

        def mbId = play[mbIdField] as String,
            mbEntity = mbId ? MbEntity.findByMbId(mbId) : null

        if (!mbEntity) {
            return [
                play : play,
                error: mbId ? "No no $entityType found with MBID $mbId." : "Play $mbIdField not set"
            ]
        }

        play[playField] = mbEntity.name
        play.save()

        return [play: play, entityName: play[playField]]
    }

    private URI buildUri(String path, Map queryParams = [:]) {
        def uriBuilder = new URIBuilder("${baseApiUri}${path}")

        [
            *  : queryParams,
            fmt: 'json'
        ].each { k, v -> uriBuilder.addParameter(k.toString(), v.toString()) }
        return uriBuilder.build()
    }

    private getBaseApiUri() {
        return configService.getBool('useLocalMBAPI', false) ? "http://localhost:5000/ws/2/" : "https://musicbrainz.org/ws/2/"
    }

    private JSONClient getClient() {
        return _client ?= new JSONClient()
    }

    @Override
    void clearCaches() {
        super.clearCaches()
        _client = null
    }
}


