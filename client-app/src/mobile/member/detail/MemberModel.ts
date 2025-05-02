import {HoistModel, managed, XH} from '@xh/hoist/core';
import {computed, makeObservable} from '@xh/hoist/mobx';
import {Member} from '../../../core/Types';
import {PlayListModel} from '../../play/list/PlayListModel';

export class MemberModel extends HoistModel {
    @managed playListModel: PlayListModel;

    @computed
    get member(): Member {
        return XH.clubService.getMember(this.componentProps.memberSlug);
    }

    constructor() {
        super();
        makeObservable(this);

        this.playListModel = new PlayListModel({parentDim: 'member'});

        this.addReaction({
            track: () => this.member,
            run: () => {
                const {member} = this;
                this.playListModel.loadData(member?.plays);
            },
            fireImmediately: true
        });
    }
}
