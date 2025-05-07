import {dataView} from '@xh/hoist/cmp/dataview';
import {hbox} from '@xh/hoist/cmp/layout';
import {hoistCmp, uses} from '@xh/hoist/core';
import {button} from '@xh/hoist/mobile/cmp/button';
import {textInput} from '@xh/hoist/mobile/cmp/input';
import {panel} from '@xh/hoist/mobile/cmp/panel';
import {titleBar} from '../cmp/TitleBar';
import {SearchListModel} from './SearchListModel';
import {Icon} from '@xh/hoist/icon';

export const searchListView = hoistCmp.factory({
    displayName: 'SearchListView',
    className: 'mc-list',
    model: uses(() => SearchListModel),

    render({model, className}) {
        return panel({
            tbar: titleBar({title: 'Search'}),
            className,
            items: [
                hbox({
                    padding: 10,
                    gap: 10,
                    alignItems: 'center',
                    items: [
                        textInput({
                            className: 'mc-search-input',
                            bind: 'query',
                            autoCapitalize: 'none',
                            commitOnChange: true,
                            placeholder: 'Looking for...',
                            flex: 1,
                            ref: model.inputRef
                        }),
                        button({
                            icon: Icon.x(),
                            minimal: true,
                            disabled: !model.query,
                            onClick: () => {
                                model.query = '';
                            }
                        })
                    ]
                }),
                dataView()
            ]
        });
    }
});
