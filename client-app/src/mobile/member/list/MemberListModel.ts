import {DataViewModel} from '@xh/hoist/cmp/dataview';
import {div, h1, hbox, span} from '@xh/hoist/cmp/layout';
import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {StoreRecord} from '@xh/hoist/data';
import {NavigatorModel} from '@xh/hoist/mobile/cmp/navigator';
import {action, makeObservable} from '@xh/hoist/mobx';
import {Member} from '../../../core/Types';
import {countTiles} from '../../cmp/CountTiles';
import {playView} from '../../play/detail/PlayView';
import {memberView} from '../detail/MemberView';
import {memberListView} from './MemberListView';

/**
 * A list of members, with drilldown to {@link memberView} detail.
 */
export class MemberListModel extends HoistModel {
    @managed navigatorModel: NavigatorModel;
    @managed dataViewModel: DataViewModel;

    constructor({route}: {route: string}) {
        super();
        makeObservable(this);

        this.navigatorModel = new NavigatorModel({
            track: true,
            route,
            pages: [
                {id: 'members', content: () => memberListView()},
                {id: 'member', content: memberView},
                {id: 'play', content: playView}
            ]
        });

        this.dataViewModel = new DataViewModel({
            store: {
                idSpec: 'slug',
                fields: [
                    {name: 'name', type: 'string'},
                    {name: 'firstMeetingDate', type: 'localDate'},
                    {name: 'meetingCount', type: 'number'},
                    {name: 'playCount', type: 'number'}
                ]
            },
            sortBy: `name`,
            selModel: null,
            showHover: false,
            itemHeight: 100,
            renderer: (v, {record}) => {
                const member = record.data as Member;
                return hbox({
                    className: `mc-list__item mc-list__item--member`,
                    items: [
                        div({
                            className: 'mc-list__item__data',
                            items: [h1(span(member.name))]
                        }),
                        countTiles({
                            count: member.meetingCount
                        })
                    ]
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
