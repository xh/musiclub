import {HoistAuthModel, managed, PlainObject, XH} from '@xh/hoist/core';
import {AuthZeroClient, AuthZeroClientConfig} from '@xh/hoist/security/authzero';

export class AuthModel extends HoistAuthModel {
    @managed
    client: AuthZeroClient;

    override async completeAuthAsync(): Promise<boolean> {
        this.setMaskMsg('Authenticating...');

        const config: PlainObject = await this.loadConfigAsync();

        // If OAuth is disabled (the non-standard case), we enable forms-based login by mutating
        // the appSpec, then return the result of the server-based auth check - will be false if
        // the user does not have a session, triggering the Hoist login form.
        if (!config.useOAuth) {
            XH.appSpec.enableLoginForm = true;
            const ret = await this.getAuthStatusFromServerAsync();
            this.setMaskMsg(null);
            return ret;
        }

        // Otherwise proceed with the primary OAuth flow.
        this.client = this.createClient(config);
        await this.client.initAsync();

        XH.fetchService.addDefaultHeaders(async opts => {
            if (opts.url.startsWith('http')) return null;

            const idToken = await this.client.getIdTokenAsync();
            return idToken ? {Authorization: `Bearer ${idToken.value}`} : null;
        });

        const ret = await this.getAuthStatusFromServerAsync();
        this.setMaskMsg(null);
        return ret;
    }

    override async logoutAsync() {
        await super.logoutAsync();
        await this.client?.logoutAsync();
    }

    private createClient(config: PlainObject): AuthZeroClient {
        return new AuthZeroClient({
            idScopes: ['profile'],
            ...(config as AuthZeroClientConfig)
        });
    }

    // Update load mask to provide an indication that this auth flow is processing.
    private setMaskMsg(msg: string) {
        XH.appContainerModel.initializingLoadMaskMessage = msg;
    }
}
