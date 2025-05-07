import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {GridSorterLike} from '@xh/hoist/cmp/grid';
import {
    HoistModel,
    LoadSpec,
    managed,
    persist,
    PersistOptions,
    SelectOption,
    XH
} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {Icon} from '@xh/hoist/icon';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {action, bindable, computed, makeObservable} from '@xh/hoist/mobx';
import {wait} from '@xh/hoist/promise';
import {pluralize} from '@xh/hoist/utils/js';
import {orderBy} from 'lodash';
import {meetingGroupItem} from '../../../core/cmp/renderers/MeetingGroupItem';
import {meetingItem} from '../../../core/cmp/renderers/MeetingItem';
import {Meeting, MeetingDim, MeetingGroup} from '../../../core/Types';
import {DATA_VIEW_CONF} from '../../cmp/Utils';
import {playView} from '../../play/detail/PlayView';
import {meetingView} from '../detail/MeetingView';
import {meetingListView} from './MeetingListView';

export class MeetingListModel extends HoistModel {
    override persistWith: PersistOptions = {localStorageKey: 'meetingList'};

    @managed navigatorModel: NavigatorModel;
    @managed dataViewModel: DataViewModel;

    selectableDims: SelectOption[] = [
        {label: Icon.calendar(), value: 'year'},
        {label: Icon.location(), value: 'location'},
        {label: Icon.list(), value: 'meeting'}
    ];

    @bindable @persist dim: MeetingDim = 'year';
    @bindable.ref expandedGroups: Record<string, boolean> = {};

    @bindable @persist sort: 'asc' | 'desc' = 'desc';

    /**
     * We need to play games with sorting to get our fake expand/collapse working properly.
     *
     * We also never sort parent location groups in reverse order - it's just weird - so we
     * force the first-level (parent) sort to asc if that's our groupBy dim.
     */
    @computed.struct
    get effectiveSort(): GridSorterLike[] {
        const parentSort = this.dim === 'location' ? 'asc' : this.sort;
        return [`sortKey|${parentSort}`, `isChild|asc`, `childSortKey|${this.sort}`];
    }

    get title(): string {
        return pluralize(this.dim);
    }

    constructor() {
        super();
        makeObservable(this);

        this.navigatorModel = new NavigatorModel({
            track: true,
            route: 'mobile.meetings',
            pages: [
                {id: 'meetings', content: () => meetingListView()},
                {id: 'meeting', content: meetingView},
                {id: 'play', content: playView}
            ]
        });

        this.dataViewModel = new DataViewModel({
            ...DATA_VIEW_CONF,
            sortBy: this.effectiveSort,
            store: {
                fields: [
                    {name: 'type', type: 'string'},
                    {name: 'meetingGroup', type: 'auto'},
                    {name: 'meeting', type: 'auto'},
                    {name: 'groupId', type: 'string'},
                    {name: 'parentDim', type: 'string'},
                    {name: 'isChild', type: 'bool'},
                    {name: 'sortKey', type: 'string'},
                    {name: 'childSortKey', type: 'string'}
                ]
            },
            renderer: (v, {record}) => {
                const row = record.data as RowData,
                    {type, meetingGroup, meeting, isChild, parentDim} = row;

                return type === 'meetingGroup'
                    ? meetingGroupItem({
                          meetingGroup,
                          isChild
                      })
                    : meetingItem({
                          meeting,
                          isChild,
                          parentDim
                      });
            },
            onRowClicked: ({data}) => this.onRowClicked(data)
        });

        this.addReaction(
            {
                track: () => this.dim,
                run: () => {
                    this.expandedGroups = {};
                    this.refreshAsync();
                }
            },
            {
                track: () => this.effectiveSort,
                run: ef => this.dataViewModel.setSortBy(ef)
            },
            {
                track: () => [this.expandedGroups, this.lastLoadCompleted],
                run: () => this.updateFilter()
            }
        );
    }

    toggleSort() {
        this.sort = this.sort === 'asc' ? 'desc' : 'asc';
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const {dim, dataViewModel} = this,
            data: RowData[] = [];

        if (dim != 'meeting') {
            const groups = XH.clubService.getMeetingsBy(dim);
            groups.forEach(grp => {
                const groupId = `${grp.dimension}-${grp.id}`;

                data.push(
                    {
                        type: 'meetingGroup',
                        meetingGroup: grp,
                        id: groupId,
                        groupId,
                        isChild: false,
                        sortKey: groupId
                    },
                    ...grp.meetings.map(mtg => {
                        return {
                            type: 'meeting' as const,
                            meeting: mtg,
                            id: mtg.slug,
                            groupId: groupId,
                            parentDim: dim,
                            isChild: true,
                            sortKey: groupId,
                            childSortKey: mtg.date.toString()
                        };
                    })
                );
            });
        } else {
            const meetings = XH.clubService.meetings;
            meetings.forEach(mtg => {
                data.push({
                    type: 'meeting',
                    meeting: mtg,
                    id: mtg.id,
                    groupId: mtg.slug,
                    isChild: false,
                    sortKey: mtg.date.toString()
                });
            });
        }

        dataViewModel.loadData(data);
    }

    getMeetingTitle(mtg: Meeting) {
        const date =
            this.dim === 'dateYear' ? mtg.date.format('MMM-DD') : mtg.date.format('YYYY-MM-DD');
        return `#${mtg.slug} ${date}`;
    }

    getMeetingSubtitle(mtg: Meeting) {
        const {dim} = this;
        if (dim === 'year') return mtg.location;
        if (dim === 'location') return `${mtg.year}`;
        return `${mtg.year} - ${mtg.location}`;
    }

    private updateFilter() {
        this.dataViewModel.store.setFilter(rec => {
            return !rec.data.isChild || this.expandedGroups[rec.data.groupId] === true;
        });
    }

    @action
    private onRowClicked(rec: StoreRecord) {
        if (!rec) return;

        const {dataViewModel, expandedGroups: grps} = this,
            {type, meeting} = rec.data as RowData;

        if (type === 'meeting') {
            XH.appendRoute('meeting', {meetingSlug: meeting.slug});
        } else {
            const expanded = !grps[rec.id];
            this.expandedGroups = {
                ...grps,
                [rec.id]: expanded
            };

            // Locate a newly expanded child record a few rows down in the group and ensure visible.
            // Avoids a situation where the user has expanded a group at the bottom of the screen
            // and the newly-expanded children are not visible, making the list seem broken.
            if (expanded) {
                wait().then(() => {
                    let meetingRecs = dataViewModel.store.allRecords.filter(otherRec => {
                        const {groupId, type} = otherRec.data as RowData;
                        return groupId === rec.id && type === 'meeting';
                    });

                    meetingRecs = orderBy(meetingRecs, 'sortKey', this.sort);

                    // Scroll to show up to three children, or the last one if fewer.
                    const idxToShow = Math.min(meetingRecs.length - 1, 2);
                    dataViewModel.gridModel.ensureRecordsVisibleAsync(meetingRecs[idxToShow]);
                });
            }
        }
    }
}

interface RowData {
    type: 'meetingGroup' | 'meeting';
    meetingGroup?: MeetingGroup;
    meeting?: Meeting;
    id: string | number;
    groupId: string;
    parentDim?: MeetingDim;
    isChild: boolean;
    sortKey: string;
    childSortKey?: string;
}
