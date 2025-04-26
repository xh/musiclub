import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {ModuleRegistry} from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-balham.css';
import {AgGridReact} from '@ag-grid-community/react';
import {ClipboardModule} from '@ag-grid-enterprise/clipboard';
import {ColumnsToolPanelModule} from '@ag-grid-enterprise/column-tool-panel';
import {EnterpriseCoreModule, LicenseManager} from '@ag-grid-enterprise/core';
import {FiltersToolPanelModule} from '@ag-grid-enterprise/filter-tool-panel';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
import {SideBarModule} from '@ag-grid-enterprise/side-bar';
import {SparklinesModule} from '@ag-grid-enterprise/sparklines';
import {XH} from '@xh/hoist/core';
import {installAgGrid} from '@xh/hoist/kit/ag-grid';
import {installHighcharts} from '@xh/hoist/kit/highcharts';
import {when} from '@xh/hoist/mobx';
import Highcharts from 'highcharts/highstock';
import highchartsExportData from 'highcharts/modules/export-data';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsHeatmap from 'highcharts/modules/heatmap';
import highchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import highchartsTreeGraph from 'highcharts/modules/treegraph';
import highchartsTree from 'highcharts/modules/treemap';
import {ClubService} from './core/services/ClubService';

//------------------
// Service Declarations
//------------------
declare module '@xh/hoist/core' {
    // Merge interface with XHApi class to include injected services.
    export interface XHApi {
        clubService: ClubService;
    }
    // @ts-ignore - Help IntelliJ recognize uses of injected service methods on the `XH` singleton.
    export const XH: XHApi;

    export interface HoistUser {
        profilePicUrl: string;
    }
}

//------------------
// AG Grid
//------------------
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    MenuModule,
    RowGroupingModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SparklinesModule
]);
installAgGrid(AgGridReact, EnterpriseCoreModule.version);

when(
    () => XH.appIsRunning,
    () => {
        const agLicense = XH.getConf('jsLicenses').agGrid;
        if (agLicense) LicenseManager.setLicenseKey(agLicense);
    }
);

//------------------
// Highcharts
//------------------
highchartsExportData(Highcharts);
highchartsExporting(Highcharts);
highchartsHeatmap(Highcharts);
highchartsOfflineExporting(Highcharts);
highchartsTree(Highcharts);
highchartsTreeGraph(Highcharts);
installHighcharts(Highcharts);
