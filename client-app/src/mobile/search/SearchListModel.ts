import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {HoistInputModel} from '@xh/hoist/cmp/input';
import {placeholder} from '@xh/hoist/cmp/layout';
import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {Icon} from '@xh/hoist/icon';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {action, bindable, makeObservable} from '@xh/hoist/mobx';
import {createObservableRef} from '@xh/hoist/utils/react';
import {meetingItem} from '../../core/cmp/renderers/MeetingItem';
import {memberItem} from '../../core/cmp/renderers/MemberItem';
import {playItem} from '../../core/cmp/renderers/PlayItem';
import {Entity, Meeting, Member, Play} from '../../core/Types';
import {DATA_VIEW_CONF} from '../cmp/Utils';
import {meetingView} from '../meeting/detail/MeetingView';
import {memberView} from '../member/detail/MemberView';
import {playView} from '../play/detail/PlayView';
import {searchListView} from './SearchListView';

export class SearchListModel extends HoistModel {
    @managed navigatorModel: NavigatorModel;
    @managed dataViewModel: DataViewModel;

    @bindable query: string = null;

    inputRef = createObservableRef<HoistInputModel>();

    constructor() {
        super();
        makeObservable(this);

        this.navigatorModel = new NavigatorModel({
            track: true,
            route: 'mobile.search',
            pages: [
                {id: 'search', content: searchListView},
                {id: 'meeting', content: meetingView},
                {id: 'member', content: memberView},
                {id: 'play', content: playView}
            ]
        });

        this.dataViewModel = new DataViewModel({
            ...DATA_VIEW_CONF,
            itemHeight: 130,
            emptyText: placeholder(Icon.search()),
            sortBy: 'sortOrder',
            store: {
                fields: [
                    {name: 'sortOrder', type: 'number'},
                    {name: 'entity', type: 'auto'}
                ]
            },
            renderer: (v, {record}) => {
                const entity = record.data.entity as Entity;
                switch (entity.type) {
                    case 'meeting':
                        return meetingItem({meeting: entity as Meeting});
                    case 'member':
                        return memberItem({member: entity as Member});
                    case 'play':
                        return playItem({play: entity as Play});
                }
                return null; // unexpected
            },
            onRowClicked: ({data}) => this.onRowClicked(data)
        });

        this.addReaction(
            {
                track: () => this.query,
                run: () => {
                    this.refreshAsync();
                },
                debounce: 300
            },
            // Doesn't work on iOS (Apple doesn't allow it - must be user action)
            {
                track: () => this.inputRef.current,
                run: inputModel => inputModel.focus(),
                debounce: 300
            }
        );
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const {query, dataViewModel} = this;

        if (!query?.trim()) {
            dataViewModel.clear();
            return;
        }

        const results = await XH.searchService.searchAsync(query);
        this.dataViewModel.loadData(
            results.map((it, idx) => ({
                id: `${it.type}|${it.slug}`,
                sortOrder: idx,
                entity: it
            }))
        );
    }

    @action
    private onRowClicked(record: StoreRecord) {
        const {type, slug} = record.data.entity as Entity;
        switch (type) {
            case 'meeting':
                XH.appendRoute('meeting', {meetingSlug: slug});
                break;
            case 'member':
                XH.appendRoute('member', {memberSlug: slug});
                break;
            case 'play':
                XH.appendRoute('play', {playSlug: slug});
                break;
        }
    }
}
