import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {div, h1, h2, hbox, span} from '@xh/hoist/cmp/layout';
import {HoistModel, LoadSpec, managed, persist, PersistOptions, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {action, bindable, makeObservable} from '@xh/hoist/mobx';
import {wait} from '@xh/hoist/promise';
import {Meeting, MeetingDim} from '../../../core/Types';
import {countTiles} from '../../cmp/CountTiles';
import {playView} from '../../play/detail/PlayView';
import {meetingView} from '../detail/MeetingView';
import {meetingListView} from './MeetingListView';

export class MeetingListModel extends HoistModel {
    override persistWith: PersistOptions = {localStorageKey: 'musiclubList'};

    @managed navigatorModel: NavigatorModel;
    @managed dataViewModel: DataViewModel;

    title: string;
    selectableDims: MeetingDim[];
    @bindable @persist dim: MeetingDim;
    @bindable @persist sort: 'asc' | 'desc';
    @bindable.ref expandedGroups: Record<string, boolean> = {};

    constructor({
        route,
        title = 'Meetings',
        dim,
        selectableDims,
        sort
    }: {
        route: string;
        title: string;
        dim: MeetingDim;
        selectableDims: MeetingDim[];
        sort?: 'asc' | 'desc';
    }) {
        super();
        makeObservable(this);

        this.title = title;
        this.dim = dim;
        this.selectableDims = selectableDims ?? [];
        this.sort = sort ?? 'asc';

        // mobile.years => years
        const listViewRoute = route.substring(route.lastIndexOf('.') + 1);

        this.navigatorModel = new NavigatorModel({
            track: true,
            route,
            pages: [
                {id: listViewRoute, content: () => meetingListView()},
                {id: 'meeting', content: meetingView},
                {id: 'play', content: playView}
            ]
        });

        this.dataViewModel = new DataViewModel({
            store: {
                fields: [
                    {name: 'groupId', type: 'string'},
                    {name: 'title', type: 'string'},
                    {name: 'subtitle', type: 'string'},
                    {name: 'dimension', type: 'string'},
                    {name: 'sortKey', type: 'string'},
                    {name: 'count', type: 'number', defaultValue: 0},
                    {name: 'bonusCount', type: 'number', defaultValue: 0},
                    {name: 'isChild', type: 'bool'}
                ]
            },
            sortBy: `sortKey|${this.sort}`,
            selModel: null,
            showHover: false,
            itemHeight: 100,
            renderer: (v, {record}) => {
                const row = record.data as RowData;
                return hbox({
                    className: `mc-list__item mc-list__item--${row.dimension} ${row.isChild ? 'mc-list__item--child' : 'mc-list__item--parent'}`,
                    items: [
                        div({
                            className: 'mc-list__item__data',
                            items: [
                                h1(span(row.title)),
                                h2({
                                    item: span(row.subtitle),
                                    omit: !row.subtitle
                                })
                            ]
                        }),
                        countTiles({
                            count: row.count,
                            bonusCount: row.bonusCount,
                            big: row.dimension !== 'meeting'
                        })
                    ]
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
                track: () => this.sort,
                run: () => {
                    this.dataViewModel.setSortBy(`sortKey|${this.sort}`);
                }
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
        const {dim} = this,
            data: RowData[] = [];

        if (dim) {
            const groups = XH.clubService.getMeetingsBy(dim);
            groups.forEach(grp => {
                const groupId = `${grp.dimension}-${grp.id}`;
                data.push(
                    {
                        id: groupId,
                        groupId,
                        title: grp.title,
                        dimension: grp.dimension,
                        count: grp.meetingCount,
                        sortKey: `[${groupId}]`,
                        isChild: false
                    },
                    ...grp.meetings.map(mtg => {
                        return {
                            id: mtg.slug,
                            groupId: groupId,
                            title: this.getMeetingTitle(mtg),
                            subtitle: this.getMeetingSubtitle(mtg),
                            dimension: 'meeting' as const,
                            count: mtg.plays.filter(it => !it.bonus).length,
                            bonusCount: mtg.plays.filter(it => it.bonus).length,
                            sortKey: `[${groupId}][${mtg.date}]`,
                            isChild: true
                        };
                    })
                );
            });
        } else {
            const meetings = XH.clubService.meetings;
            meetings.forEach(mtg => {
                data.push({
                    id: mtg.id,
                    groupId: mtg.slug,
                    title: this.getMeetingTitle(mtg),
                    subtitle: this.getMeetingSubtitle(mtg),
                    dimension: 'meeting' as const,
                    count: mtg.plays.filter(it => !it.bonus).length,
                    bonusCount: mtg.plays.filter(it => it.bonus).length,
                    sortKey: mtg.date.toString(),
                    isChild: false
                });
            });
        }
        this.dataViewModel.loadData(data);
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
            return (
                !this.dim ||
                rec.data.dimension !== 'meeting' ||
                this.expandedGroups[rec.data.groupId] === true
            );
        });
    }

    @action
    private onRowClicked(rec: StoreRecord) {
        const {dataViewModel, expandedGroups: grps} = this,
            dim: MeetingDim = rec?.data.dimension;

        if (dim === 'meeting') {
            XH.appendRoute('meeting', {meetingSlug: rec.id});
        } else {
            const expanded = !grps[rec.id];
            this.expandedGroups = {
                ...grps,
                [rec.id]: expanded
            };

            if (expanded) {
                wait().then(() => {
                    const meetingRec = dataViewModel.store.records.find(
                        it => it.data.groupId === rec.id && it.data.dimension === 'meeting'
                    );
                    dataViewModel.gridModel.ensureRecordsVisibleAsync(meetingRec);
                });
            }
        }
    }
}

interface RowData {
    id: string | number;
    isChild: boolean;
    groupId: string;
    title: string;
    subtitle?: string;
    dimension: MeetingDim;
    count: number;
    bonusCount?: number;
    sortKey: string;
}
