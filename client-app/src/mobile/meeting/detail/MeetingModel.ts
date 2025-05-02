import {HoistModel, managed, XH} from '@xh/hoist/core';
import {computed, makeObservable} from '@xh/hoist/mobx';
import {Meeting} from '../../../core/Types';
import {PlayListModel} from '../../play/list/PlayListModel';

export class MeetingModel extends HoistModel {
    @managed playListModel: PlayListModel;

    @computed
    get meeting(): Meeting {
        return XH.clubService.getMeeting(this.componentProps.meetingSlug);
    }

    constructor() {
        super();
        makeObservable(this);

        this.playListModel = new PlayListModel({parentDim: 'meeting'});

        this.addReaction({
            track: () => this.meeting,
            run: () => {
                const {meeting} = this;
                this.playListModel.loadData(meeting?.plays);
            },
            fireImmediately: true
        });
    }
}
