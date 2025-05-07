const configureWebpack = require('@xh/hoist-dev-utils/configureWebpack');

module.exports = (env = {}) => {
    return configureWebpack({
        appCode: 'musiclub',
        appName: 'Musiclüb',
        appVersion: '1.0-SNAPSHOT',
        favicon: './public/favicon.svg',
        devServerOpenPage: null,
        dupePackageCheckExcludes: ['es-abstract', 'tslib'],
        preloadBackgroundColor: '#ef6c00',
        reactProdMode: false,
        manifestConfig: {
            description:
                'Musiclüb is an LA-based monthly music appreciation club that takes it one year at a time.',
            orientation: 'portrait'
        },
        ...env
    });
};
