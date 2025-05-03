import {hoistCmp, uses} from '@xh/hoist/core';
import {navigator} from '@xh/hoist/mobile/cmp/navigator';
import {MeetingListModel} from './MeetingListModel';

export const meetingList = hoistCmp.factory({
    displayName: 'MeetingList',
    model: uses(MeetingListModel),

    render() {
        return navigator();
    }
});
