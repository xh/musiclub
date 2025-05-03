import {AppModel} from '@xh/hoist/admin/AppModel';
import {creates, hoistCmp, HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {RecordActionSpec} from '@xh/hoist/data';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {
    addAction,
    deleteAction,
    editAction,
    restGrid,
    RestGridModel,
    viewAction
} from '@xh/hoist/desktop/cmp/rest';
import {Icon} from '@xh/hoist/icon';

export const mbEntitiesRestGrid = hoistCmp.factory({
    model: creates(() => MbEntitiesRestGridModel),
    render() {
        return panel({
            item: restGrid(),
            mask: 'onLoad'
        });
    }
});

class MbEntitiesRestGridModel extends HoistModel {
    @managed gridModel: RestGridModel;

    constructor() {
        super();

        this.gridModel = new RestGridModel({
            enableExport: true,
            selModel: 'multiple',
            store: {
                url: 'rest/entitiesAdmin',
                fields: [
                    {name: 'type', type: 'string', required: true},
                    {name: 'name', type: 'string'},
                    {name: 'mbId', type: 'string', displayName: 'MusicBrainz ID'},
                    {name: 'mbJson', type: 'json', displayName: 'MusicBrainz Data'}
                ]
            },
            unit: 'entity',
            sortBy: ['type', 'name'],
            columns: [
                {field: 'type'},
                {field: 'name', autosizeMaxWidth: 500},
                {field: 'mbId'},
                {field: 'mbJson', autosizable: false, width: 300}
            ],
            editors: [{field: 'type'}, {field: 'name'}, {field: 'mbId'}, {field: 'mbJson'}],
            emptyText: 'No entities found...',
            toolbarActions: [addAction, editAction, deleteAction, this.refreshAction],
            menuActions: [addAction, editAction, viewAction, deleteAction, '-', this.refreshAction],
            actionWarning: {
                del: 'Deleting this entity might break references to it from plays. Continue anyway?'
            }
        });
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        await this.gridModel.loadAsync(loadSpec);
    }

    //------------------
    // Actions
    //------------------
    refreshAction: RecordActionSpec = {
        text: 'Refresh from MB',
        icon: Icon.refresh(),
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.refreshEntities(selectedRecords.map(it => it.id as number));
        }
    };

    async refreshEntities(ids: number[]) {
        try {
            const results = await XH.postJson({
                url: 'entitiesAdmin/refreshMany',
                body: {ids}
            }).linkTo({
                observer: this.loadModel,
                message: 'Refreshing entities...'
            });

            console.log(results);
            await this.refreshAsync();
        } catch (e) {
            XH.handleException(e);
        }
    }
}
