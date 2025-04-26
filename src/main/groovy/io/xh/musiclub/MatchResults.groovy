package io.xh.musiclub

/**
 * DTO for the results of a match against the MusicBrainz database.
 */
class MatchResults {
    MbEntity mbEntity
    String error
    String notes
    List<Map> possibleMatches = []

    String getMbId() { mbEntity?.mbId }
}
