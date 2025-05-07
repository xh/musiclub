import {creates, hoistCmp} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {MeetingListModel} from './MeetingListModel';

export const meetingList = hoistCmp.factory({
    displayName: 'MeetingList',
    model: creates(MeetingListModel),

    render() {
        return navigator();
    }
});
