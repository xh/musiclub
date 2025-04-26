package io.xh.musiclub

/**
 * DTO for the results of a play enhancement request against the MusicBrainz database.
 */
class ResResults {
    Play play
    String entityType
    /** Entity from match results, or pre-existing */
    MbEntity mbEntity
    String query
    boolean isFallback
    String error
    MatchResults matchResults
    ResResults priorResults

    ResResults withError(String error) {
        this.error = error
        this
    }

    ResResults withEntity(MbEntity mbEntity) {
        this.mbEntity = mbEntity
        this
    }

    ResResults withPriorResults(ResResults priorResults) {
        this.priorResults = priorResults
        this
    }
}
