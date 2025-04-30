import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {div, h2, hbox, img, p} from '@xh/hoist/cmp/layout';
import {HoistModel, managed, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {computed, makeObservable} from '@xh/hoist/mobx';
import {albumIcon, artistIcon, trackIcon} from '../../core/Icons';
import {Meeting, Play} from '../../core/Types';

export class MeetingModel extends HoistModel {
    @managed dataViewModel: DataViewModel;

    @computed
    get meeting(): Meeting {
        return XH.clubService.getMeeting(this.componentProps.meetingSlug);
    }

    constructor() {
        super();
        makeObservable(this);

        this.dataViewModel = new DataViewModel({
            store: {
                fields: XH.clubService.playFields
            },
            sortBy: 'slug',
            groupBy: 'bonusDisplay',
            showHover: false,
            itemHeight: 130,
            selModel: null,
            showGroupRowCounts: false,
            renderer: (v, {record}) => {
                const play: Play = record.data as Play;
                return hbox({
                    className: `mc-list__item mc-list__item--songPlay mc-song-play ${play.coverArtThumbUrl ? 'mc-song-play--has-cover-art' : ''}`,
                    items: [
                        div({
                            className: 'mc-song-play__data',
                            items: [
                                h2({
                                    item: play.member,
                                    className: 'mc-member'
                                }),
                                p(artistIcon(), play.artist),
                                p(albumIcon(), play.album),
                                p(trackIcon(), play.title)
                            ]
                        }),
                        img({
                            src: play.coverArtThumbUrl,
                            className: 'mc-song-play__cover-art',
                            alt: play.title,
                            omit: !play.coverArtThumbUrl
                        })
                    ]
                });
            },
            // Flip group sort - "Main Picks" before "Bonus Round"
            groupSortFn: (a, b, field, {gridModel}) => {
                return gridModel.defaultGroupSortFn(b, a);
            },
            onRowClicked: ({data}) => this.onRowClicked(data)
        });

        this.addReaction({
            track: () => this.meeting,
            run: () => {
                const {meeting} = this;
                if (meeting) {
                    this.dataViewModel.loadData(meeting.plays);
                } else {
                    this.dataViewModel.clear();
                }
            },
            fireImmediately: true
        });
    }

    private onRowClicked(rec: StoreRecord) {
        if (rec?.data.slug) {
            XH.appendRoute('play', {playSlug: rec.data.slug});
        }
    }
}
