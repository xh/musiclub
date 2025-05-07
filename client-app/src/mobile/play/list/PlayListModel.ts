import {DataViewConfig, DataViewModel} from '@xh/hoist/cmp/dataview';
import {GridSorterLike} from '@xh/hoist/cmp/grid';
import {HoistModel, managed, Some, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {playItem} from '../../../core/cmp/renderers/PlayItem';
import {Play} from '../../../core/Types';
import {DATA_VIEW_CONF} from '../../cmp/Utils';

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
            ...DATA_VIEW_CONF,
            itemHeight: 130,
            store: {fields: XH.clubService.playFields},
            sortBy: ['meetingDate', 'slug'],
            groupBy,
            renderer: (v, {record}) => {
                return playItem({
                    play: record.raw as Play,
                    parentDim
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
