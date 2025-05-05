import {DataViewConfig, DataViewModel} from '@xh/hoist/cmp/dataview';
import {GridSorterLike} from '@xh/hoist/cmp/grid';
import {div, h2, hbox, img, p} from '@xh/hoist/cmp/layout';
import {HoistModel, managed, Some, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {albumIcon, artistIcon, trackIcon} from '../../../core/Icons';
import {Play} from '../../../core/Types';

export class PlayListModel extends HoistModel {
    @managed dataViewModel: DataViewModel;

    constructor({
        parentDim,
        groupBy,
        dataViewConfig
    }: {
        parentDim?: 'meeting' | 'member' | null;
        groupBy?: string;
        dataViewConfig?: Partial<DataViewConfig>;
    } = {}) {
        super();

        this.dataViewModel = new DataViewModel({
            store: {
                fields: XH.clubService.playFields
            },
            sortBy: ['meetingDate', 'slug'],
            groupBy,
            showHover: false,
            itemHeight: 130,
            selModel: null,
            showGroupRowCounts: false,
            renderer: (v, {record}) => {
                const play: Play = record.data as Play;
                return hbox({
                    className: `mc-list__item mc-list__item--play ${play.coverArtThumbUrl ? 'mc-list__item--play--with-cover-art' : ''}`,
                    items: [
                        div({
                            className: 'mc-list__item__data',
                            items: [
                                parentDim === 'meeting'
                                    ? h2(play.member)
                                    : parentDim === 'member'
                                      ? h2(play.meetingName)
                                      : h2(play.member, ' @ ', play.meetingName),
                                p(trackIcon(), play.title),
                                p(artistIcon(), play.artist),
                                p(albumIcon(), play.album)
                            ]
                        }),
                        img({
                            src: play.coverArtThumbUrl,
                            className: 'mc-list__item--play__cover-art',
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
            onRowClicked: ({data}) => this.onRowClicked(data),
            ...dataViewConfig
        });
    }

    loadData(plays: Play[]) {
        this.dataViewModel.loadData(plays ?? []);
    }

    setSortBy(sorters: Some<GridSorterLike>) {
        this.dataViewModel.setSortBy(sorters);
    }

    private onRowClicked(rec: StoreRecord) {
        if (rec?.data.slug) {
            XH.appendRoute('play', {playSlug: rec.data.slug});
        }
    }
}
