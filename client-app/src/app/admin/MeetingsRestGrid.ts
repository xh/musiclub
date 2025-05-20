import {hoistCmp} from '@xh/hoist/core';
import {textArea} from '@xh/hoist/desktop/cmp/input';
import {
    addAction,
    deleteAction,
    editAction,
    restGrid,
    RestGridConfig,
    viewAction
} from '@xh/hoist/desktop/cmp/rest';
import {LocalDate} from '@xh/hoist/utils/datetime';

export const meetingsRestGrid = hoistCmp.factory(() => restGrid({modelConfig: modelSpec}));

const modelSpec: RestGridConfig = {
    enableExport: true,
    store: {
        url: 'rest/meetingsAdmin',
        fields: [
            {name: 'slug', type: 'string', required: true},
            {name: 'location', type: 'string'},
            {name: 'date', type: 'localDate'},
            {name: 'year', type: 'string'},
            {name: 'notes', type: 'string'}
        ],
        processRawData: raw => {
            return {
                ...raw,
                date: raw.date ? LocalDate.get(raw.date) : null
            };
        }
    },
    unit: 'meeting',
    sortBy: 'slug',
    columns: [
        {field: 'slug', align: 'right', width: 80},
        {field: 'location'},
        {field: 'date'},
        {field: 'year'},
        {field: 'notes', autosizeMaxWidth: 300}
    ],
    editors: [
        {field: 'slug'},
        {field: 'location'},
        {field: 'date'},
        {field: 'year'},
        {field: 'notes', formField: {item: textArea({height: 150})}}
    ],
    emptyText: 'No meetings found...',
    menuActions: [addAction, editAction, viewAction, deleteAction],
    actionWarning: {
        del: 'Deleting this meeting will also delete all song plays associated with it. Continue anyway?'
    }
};
