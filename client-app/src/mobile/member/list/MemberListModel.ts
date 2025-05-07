import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {action, makeObservable} from '@xh/hoist/mobx';
import {memberItem} from '../../../core/cmp/renderers/MemberItem';
import {Member} from '../../../core/Types';
import {DATA_VIEW_CONF} from '../../cmp/Utils';
import {playView} from '../../play/detail/PlayView';
import {memberView} from '../detail/MemberView';
import {memberListView} from './MemberListView';

/**
 * A list of members, with drilldown to {@link memberView} detail.
 */
export class MemberListModel extends HoistModel {
    @managed navigatorModel: NavigatorModel;
    @managed dataViewModel: DataViewModel;

    constructor() {
        super();
        makeObservable(this);

        this.navigatorModel = new NavigatorModel({
            track: true,
            route: 'mobile.members',
            pages: [
                {id: 'members', content: memberListView},
                {id: 'member', content: memberView},
                {id: 'play', content: playView}
            ]
        });

        this.dataViewModel = new DataViewModel({
            ...DATA_VIEW_CONF,
            store: {
                idSpec: 'slug',
                fields: [{name: 'name', type: 'string'}]
            },
            sortBy: `name`,
            renderer: (v, {record}) => {
                return memberItem({
                    member: record.raw as Member
                });
            },
            onRowClicked: ({data}) => this.onRowClicked(data)
        });
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        this.dataViewModel.loadData(XH.clubService.members);
    }

    @action
    private onRowClicked(rec: StoreRecord) {
        XH.appendRoute('member', {memberSlug: rec.id});
    }
}
