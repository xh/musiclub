import {AppModel} from '@xh/hoist/admin/AppModel';
import {boolCheckCol, ColumnRenderer, ColumnSpec} from '@xh/hoist/cmp/grid';
import {a} from '@xh/hoist/cmp/layout';
import {creates, hoistCmp, HoistModel, LoadSpec, managed, PlainObject, XH} from '@xh/hoist/core';
import {RecordActionSpec, Store} from '@xh/hoist/data';
import {textArea} from '@xh/hoist/desktop/cmp/input';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {
    addAction,
    deleteAction,
    editAction,
    restGrid,
    RestGridModel,
    viewAction
} from '@xh/hoist/desktop/cmp/rest';
import {RestField} from '@xh/hoist/desktop/cmp/rest/data/RestField';
import {Icon} from '@xh/hoist/icon';
import {MINUTES} from '@xh/hoist/utils/datetime';
import {kebabCase} from 'lodash';
import {albumIcon} from '../../core/Icons';

export const playsRestGrid = hoistCmp.factory({
    model: creates(() => SongPlayRestGridModel),
    render() {
        return panel({
            item: restGrid(),
            mask: 'onLoad'
        });
    }
});

class SongPlayRestGridModel extends HoistModel {
    @managed gridModel: RestGridModel;

    constructor() {
        super();

        const lookupCol: Partial<ColumnSpec> = {renderer: lookupRenderer, rendererIsComplex: true},
            mbCol: Partial<ColumnSpec> = {renderer: mbRenderer, rendererIsComplex: true};

        this.gridModel = new RestGridModel({
            readonly: AppModel.readonly,
            colChooserModel: true,
            enableExport: true,
            selModel: 'multiple',
            store: {
                url: 'rest/playsAdmin',
                reloadLookupsOnLoad: true,
                processRawData: raw => {
                    const artistMb = this.lookupVal(raw, 'artistMbId'),
                        releaseGroupMb = this.lookupVal(raw, 'releaseGroupMbId'),
                        releaseMb = this.lookupVal(raw, 'releaseMbId'),
                        recordingMb = this.lookupVal(raw, 'recordingMbId');
                    return {
                        ...raw,
                        artistMb,
                        artistMatch: raw.artist && raw.artist === artistMb,
                        releaseGroupMb,
                        releaseMb,
                        albumMatch: raw.album && raw.album === releaseMb,
                        recordingMb,
                        titleMatch: raw.title && raw.title === recordingMb
                    };
                },
                fields: [
                    {name: 'slug', type: 'string', required: true},
                    {name: 'meeting', lookupName: 'meetings', type: 'number'},
                    {
                        name: 'member',
                        type: 'string',
                        lookupName: 'members',
                        enableCreate: true
                    },
                    {
                        name: 'mbStatus',
                        displayName: 'MB Match Status',
                        type: 'string',
                        lookupName: 'mbStatuses'
                    },
                    {name: 'artist', displayName: 'Artist (orig)', type: 'string'},
                    {name: 'artistMb', displayName: 'Artist (MB)', type: 'string'},
                    {name: 'artistMatch', type: 'bool'},
                    {
                        name: 'artistMbId',
                        displayName: 'Artist (MB)',
                        type: 'string',
                        lookupName: 'artists',
                        enableCreate: true
                    },
                    {name: 'albumMatch', type: 'bool'},
                    {name: 'album', displayName: 'Album (orig)', type: 'string'},
                    {name: 'releaseGroupMb', displayName: 'Release Group (MB)', type: 'string'},

                    {
                        name: 'releaseGroupMbId',
                        displayName: 'Release Group (MB)',
                        type: 'string',
                        lookupName: 'releaseGroups',
                        enableCreate: true
                    },
                    {name: 'releaseMb', displayName: 'Release (MB)', type: 'string'},
                    {
                        name: 'releaseMbId',
                        displayName: 'Release (MB)',
                        type: 'string',
                        lookupName: 'releases',
                        enableCreate: true
                    },
                    {name: 'titleMatch', type: 'bool'},
                    {name: 'title', displayName: 'Title (orig)', type: 'string'},
                    {name: 'recordingMb', displayName: 'Recording (MB)', type: 'string'},
                    {
                        name: 'recordingMbId',
                        displayName: 'Title (MB)',
                        type: 'string',
                        lookupName: 'recordings',
                        enableCreate: true
                    },
                    {name: 'coverArtUrl', displayName: 'Cover Art', type: 'string'},
                    {
                        name: 'coverArtThumbUrl',
                        displayName: 'Cover Art (Thumbmail)',
                        type: 'string'
                    },
                    {name: 'bonus', type: 'bool', defaultValue: false},
                    {name: 'notes', type: 'string'}
                ]
            },
            unit: 'play',
            sortBy: 'slug',
            filterModel: true,
            colDefaults: {autosizeMaxWidth: 350, filterable: true},
            columns: [
                {field: 'slug', align: 'right', width: 80},
                {field: 'meeting', ...lookupCol},
                {field: 'member'},
                {
                    field: 'bonus',
                    align: 'center',
                    renderer: v => (v ? Icon.checkCircle({intent: 'success'}) : '')
                },
                {field: 'mbStatus'},
                {field: 'artistMatch', ...boolCheckCol, width: 100},
                {field: 'artist'},
                {field: 'artistMb', ...mbCol},
                {field: 'albumMatch', ...boolCheckCol, width: 100},
                {field: 'album'},
                {field: 'releaseGroupMb', ...mbCol},
                {field: 'releaseMb', ...mbCol},
                {field: 'titleMatch', ...boolCheckCol, width: 100},
                {field: 'title'},
                {field: 'recordingMb', ...mbCol},
                {
                    field: 'coverArtUrl',
                    filterable: false,
                    renderer: v => (v ? a({item: v, href: v, target: '_blank'}) : '')
                },
                {
                    field: 'coverArtThumbUrl',
                    filterable: false,
                    renderer: v => (v ? a({item: v, href: v, target: '_blank'}) : '')
                },
                {field: 'notes', filterable: false}
            ],
            editors: [
                {field: 'slug'},
                {field: 'meeting'},
                {field: 'member'},
                {field: 'bonus'},
                {field: 'mbStatus'},
                {field: 'artist'},
                {field: 'artistMbId'},
                {field: 'album'},
                {field: 'releaseGroupMbId'},
                {field: 'releaseMbId'},
                {field: 'title'},
                {field: 'recordingMbId'},
                {field: 'coverArtUrl'},
                {field: 'coverArtThumbUrl'},
                {field: 'notes', formField: {item: textArea({height: 150})}}
            ],
            emptyText: 'No plays found...',
            toolbarActions: [
                addAction,
                editAction,
                deleteAction,
                this.enhancePlayAction,
                this.reEnhancePlayAction,
                this.addCoverArtAction,
                this.acceptMbEntitiesAction,
                this.markAsMismatchAction,
                this.markAsMismatchKeepArtistAction
            ],
            menuActions: [
                addAction,
                editAction,
                viewAction,
                deleteAction,
                '-',
                this.enhancePlayAction,
                this.reEnhancePlayAction,
                this.addCoverArtAction,
                '-',
                this.acceptMbEntitiesAction,
                '-',
                this.markAsMismatchAction,
                this.markAsMismatchKeepArtistAction
            ]
        });
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        await this.gridModel.loadAsync(loadSpec);
    }

    //------------------
    // Actions
    //------------------
    enhancePlayAction: RecordActionSpec = {
        text: 'Enhance',
        icon: Icon.magic(),
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.enhancePlays(
                selectedRecords.map(it => it.id as number),
                false
            );
        }
    };

    reEnhancePlayAction: RecordActionSpec = {
        text: 'Enhance (replace all existing MB IDs)',
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.enhancePlays(
                selectedRecords.map(it => it.id as number),
                true
            );
        }
    };

    async enhancePlays(ids: number[], ignoreCurrent: boolean) {
        try {
            const results = await XH.postJson({
                url: 'playsAdmin/enhanceMany',
                body: {ids, ignoreCurrent},
                timeout: 5 * MINUTES
            }).linkTo({
                observer: this.loadModel,
                message: 'Enhancing plays...'
            });

            console.log(results);
            await this.refreshAsync();
        } catch (e) {
            XH.handleException(e);
        }
    }

    acceptMbEntitiesAction: RecordActionSpec = {
        icon: Icon.checkCircle(),
        text: 'Accept MB names/titles',
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.acceptMbEntities(selectedRecords.map(it => it.id as number));
        }
    };

    async acceptMbEntities(ids: number[]) {
        try {
            const results = await XH.postJson({
                url: 'playsAdmin/acceptMany',
                body: {ids}
            }).linkTo({
                observer: this.loadModel,
                message: 'Accepting MB names/titles...'
            });

            console.log(results);
            await this.refreshAsync();
        } catch (e) {
            XH.handleException(e);
        }
    }

    markAsMismatchAction: RecordActionSpec = {
        icon: Icon.slashedCircle(),
        text: 'Mark as mismatch',
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.markAsMismatch(
                selectedRecords.map(it => it.id as number),
                false
            );
        }
    };

    markAsMismatchKeepArtistAction: RecordActionSpec = {
        text: 'Mark as mismatch (keep artist)',
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.markAsMismatch(
                selectedRecords.map(it => it.id as number),
                true
            );
        }
    };

    async markAsMismatch(ids: number[], keepArtist: boolean) {
        try {
            const results = await XH.postJson({
                url: 'playsAdmin/markAsMismatch',
                body: {ids, keepArtist}
            }).linkTo({
                observer: this.loadModel,
                message: 'Marking plays as mismatch...'
            });

            console.log(results);
            await this.refreshAsync();
        } catch (e) {
            XH.handleException(e);
        }
    }

    addCoverArtAction: RecordActionSpec = {
        text: 'Add cover art',
        icon: albumIcon(),
        disabled: AppModel.readonly,
        recordsRequired: true,
        actionFn: ({selectedRecords}) => {
            this.addCoverArt(selectedRecords.map(it => it.id as number));
        }
    };

    async addCoverArt(ids: number[]) {
        try {
            const results = await XH.postJson({
                url: 'playsAdmin/addCoverArt',
                body: {ids},
                timeout: 5 * MINUTES
            }).linkTo({
                observer: this.loadModel,
                message: 'Adding cover art...'
            });

            console.log(results);
            await this.refreshAsync();
        } catch (e) {
            XH.handleException(e);
        }
    }

    lookupVal(raw: PlainObject, fName: string) {
        const field = this.gridModel.store.getField(fName) as RestField,
            lookup = field.lookup as PlainObject[],
            v = raw[fName];
        return v ? (lookup.find(it => it.value === v)?.label ?? v) : v;
    }
}

const lookupRenderer: ColumnRenderer = (v, {record, column}) => {
    return lookupVal(v, column.field, record.store);
};

const mbRenderer: ColumnRenderer = (mbName, {record, column}) => {
    if (!mbName) return null;

    const fName = column.field,
        idfName = `${fName}Id`,
        id = record.data[idfName],
        // Convert field name to musicbrainz entity type - remove trailing `Mb` and convert to kebab-case
        // eg `artistMb` to `artist`, or `releaseGroupMb` to `release-group`
        mbType = kebabCase(fName.replace(/Mb$/, '')),
        mbUrl = `https://musicbrainz.org/${mbType}/${id}`;

    return a({
        item: mbName,
        href: mbUrl,
        target: '_blank'
    });
};

const lookupVal = (v, fName: string, store: Store) => {
    const field = store.getField(fName) as RestField,
        lookup = field.lookup as PlainObject[];
    return v ? (lookup.find(it => it.value === v)?.label ?? v) : v;
};
