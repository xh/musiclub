import {HoistModel, LoadSpec, XH} from '@xh/hoist/core';
import {computed, makeObservable, observable, runInAction} from '@xh/hoist/mobx';
import {isEmpty} from 'lodash';
import {EntityLink, Meeting, Play, PlayWithMbEntities} from '../../../core/Types';
import {extractLinks, extractStreamingLinks} from '../../../core/Utils';

export class PlayModel extends HoistModel {
    @observable.ref _playWithEntities: PlayWithMbEntities;

    @computed
    get play(): Play | PlayWithMbEntities {
        return this._playWithEntities ?? XH.clubService.getPlay(this.componentProps.playSlug);
    }

    @computed
    get meeting(): Meeting {
        return XH.clubService.getMeeting(this.play?.meetingSlug);
    }

    get statusWarning(): string {
        switch (this.play?.mbStatus) {
            case 'MISMATCH':
                return 'MISMATCH - this play could not be matched with MusicBrainz and will have limited additional metadata.';
            case 'PARTIALLY_MATCHED':
                return 'PARTIALLY MATCHED - this play matched with MusicBrainz but some metadata may be missing or incorrect.';
            case 'UNMATCHED':
                return 'UNMATCHED - this play has not yet been matched with MusicBrainz and will have limited additional metadata.';
            default:
                return null;
        }
    }

    get mbArtist() {
        return this._playWithEntities?.mbArtist;
    }

    get artistLinks(): EntityLink[] {
        return extractLinks(this.mbArtist);
    }

    get artistStreamingLinks(): EntityLink[] {
        return extractStreamingLinks(this.mbArtist);
    }

    get mbReleaseGroup() {
        return this._playWithEntities?.mbReleaseGroup;
    }

    get mbRelease() {
        return this._playWithEntities?.mbRelease;
    }

    get releaseLinks(): EntityLink[] {
        return extractLinks(this.mbRelease);
    }

    get releaseStreamingLinks(): EntityLink[] {
        return extractStreamingLinks(this.mbArtist);
    }

    get releaseTracks(): Array<{id: string; position: number; title: string; isPlay: boolean}> {
        const {mbRelease} = this;
        if (isEmpty(mbRelease?.mbJson?.media)) return [];

        // Find first media entry with a track listing.
        const medias = mbRelease.mbJson.media.filter(it => !isEmpty(it.tracks));
        if (isEmpty(medias)) return [];

        const isMulti = medias.length > 1,
            ret = [];
        medias.forEach(media => {
            const mediaPos = media.position || 1;
            media.tracks.map(it => {
                ret.push({
                    id: it.id,
                    position: isMulti ? `${mediaPos}.${it.position}` : it.position,
                    title: it.title,
                    isPlay: it.title === this.play.title // TODO - match on recording as alt?
                });
            });
        });

        return ret;
    }

    constructor() {
        super();
        makeObservable(this);
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const {play} = this;
        if (!play) {
            throw XH.exception(
                `Unable to load play data - no play found for slug: ${this.componentProps.playSlug}`
            );
        }

        const playWithEntities = await XH.clubService.getPlayWithEntities(play.id, loadSpec);
        runInAction(() => (this._playWithEntities = playWithEntities));
    }
}
