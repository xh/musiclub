const configureWebpack = require('@xh/hoist-dev-utils/configureWebpack');

module.exports = (env = {}) => {
    return configureWebpack({
        appCode: 'musiclub',
        appName: 'Musiclüb',
        appVersion: '1.0-SNAPSHOT',
        favicon: './public/favicon.svg',
        devServerOpenPage: 'app/',
        dupePackageCheckExcludes: ['es-abstract', 'tslib'],
        preloadBackgroundColor: '#f7931c',
        reactProdMode: false,
        ...env
    });
};
