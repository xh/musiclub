import {PWAInstallElement} from '@khmyznikov/pwa-install';
import {HoistModel} from '@xh/hoist/core';
import {makeObservable, observable} from '@xh/hoist/mobx';
import {wait} from '@xh/hoist/promise';
import {AppModel} from '../AppModel';

export class SettingsModel extends HoistModel {
    @observable.ref pwa: PWAInstallElement;
    @observable pwaInstallAvailable: boolean = false;
    @observable pwaInstalled: boolean = false;

    constructor() {
        super();
        makeObservable(this);
    }

    override onLinked() {
        super.onLinked();

        // The pwa-install lib has some kind of long wait internally before it finalizes its
        // isInstallAvailable and isUnderStandaloneMode properties. Wait a while, then read and
        // set on our observables so we can react to them in the view.
        wait(1500).then(() => {
            this.addReaction({
                track: () => AppModel.instance.pwaInstallRef.current,
                run: pwa => {
                    this.pwa = pwa;
                    this.pwaInstallAvailable = pwa?.isInstallAvailable ?? false;
                    this.pwaInstalled = pwa?.isUnderStandaloneMode ?? false;
                },
                fireImmediately: true
            });
        });
    }
}
