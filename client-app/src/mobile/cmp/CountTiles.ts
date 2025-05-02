import {div, vbox} from '@xh/hoist/cmp/layout';
import {hoistCmp, HoistProps} from '@xh/hoist/core';
import './CountTiles.scss';

// TODO - refactor into `PixelGauge`
export const countTiles = hoistCmp.factory<
    HoistProps & {count: number; bonusCount?: number; big?: boolean}
>({
    render({count, bonusCount, big}) {
        return vbox({
            className: `mc-count-tiles ${big ? 'mc-count-tiles--big' : ''}`,
            items: [
                ...Array.from({length: count ?? 0}).map(_ => {
                    return div({
                        className: 'mc-count-tiles__tile'
                    });
                }),
                ...Array.from({length: bonusCount ?? 0}).map(_ => {
                    return div({
                        className: 'mc-count-tiles__tile mc-count-tiles__tile--bonus'
                    });
                })
            ]
        });
    }
});
