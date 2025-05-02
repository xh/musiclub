import {dataView} from '@xh/hoist/cmp/dataview';
import {hoistCmp, uses} from '@xh/hoist/core';
import {PlayListModel} from './PlayListModel';
import './PlayList.scss';

export const playListView = hoistCmp.factory({
    displayName: 'PlayListView',
    className: 'mc-list mc-play-list',
    model: uses(PlayListModel),

    render({model, className}) {
        return dataView({className});
    }
});
