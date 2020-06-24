/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

// tslint:disable: readonly-array

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AppDto, AppsState, AuthService, DialogModel, DialogService, fadeAnimation, ModalModel, Types, UIState } from '@app/shared';
import { GridsterItem } from 'angular-gridster2';
import { take } from 'rxjs/operators';

@Component({
    selector: 'sqx-dashboard-config',
    styleUrls: ['./dashboard-config.component.scss'],
    templateUrl: './dashboard-config.component.html',
    animations: [
        fadeAnimation
    ]
})
export class DashboardConfigComponent implements OnChanges {
    @Input()
    public app: AppDto[];

    @Input()
    public config: GridsterItem[];

    @Output()
    public configChange = new EventEmitter<GridsterItem[]>();

    public configDefaults = DEFAULT_CONFIG;

    public expertDialog = new DialogModel();
    public expertConfig: GridsterItem[];

    public dropdownModal = new ModalModel();

    constructor(
        public readonly appsState: AppsState,
        public readonly authState: AuthService,
        private readonly dialogs: DialogService,
        private readonly uiState: UIState
    ) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['app']) {
            this.uiState.getUser('dashboard.grid', DEFAULT_CONFIG).pipe(take(1))
                .subscribe(dto => {
                    this.setConfig(dto);
                });
        }
    }

    private setConfig(config: any) {
        if (!Types.isArrayOfObject(config)) {
            config = DEFAULT_CONFIG;
        }

        this.configChange.emit(Types.clone(config));
    }

    public startExpertMode() {
        this.dropdownModal.hide();

        this.expertConfig = Types.clone(this.config);
        this.expertDialog.show();
    }

    public completeExpertMode() {
        this.setConfig(this.expertConfig);

        this.expertConfig = null!;
        this.expertDialog.hide();

        this.saveConfig();
    }

    public resetConfig() {
        this.setConfig(Types.clone(DEFAULT_CONFIG));

        this.saveConfig();
    }

    public saveConfig() {
        this.uiState.set('dashboard.grid', this.config, true);

        this.dialogs.notifyInfo('Configuration saved.');
    }

    public addOrRemove(item: GridsterItem) {
        const current = this.config.find(x => x.type === item.type);

        if (current) {
            this.config.splice(this.config.indexOf(current), 1);
        } else {
            this.config.push(Types.clone(item));
        }
    }

    public isSelected(item: GridsterItem) {
        return this.config.find(x => x.type === item.type);
    }
}

const DEFAULT_CONFIG: GridsterItem[] = [
    { cols: 1, rows: 1, x: 0, y: 0, type: 'schemas', name: 'Schema' },
    { cols: 1, rows: 1, x: 1, y: 0, type: 'api', name: 'API Documentation' },
    { cols: 1, rows: 1, x: 2, y: 0, type: 'support', name: 'Support' },
    { cols: 1, rows: 1, x: 3, y: 0, type: 'github', name: 'Github' },

    { cols: 2, rows: 1, x: 0, y: 1, type: 'api-calls', name: 'API Calls Chart' },
    { cols: 2, rows: 1, x: 2, y: 1, type: 'api-performance', name: 'API Performance Chart' },

    { cols: 1, rows: 1, x: 0, y: 2, type: 'api-calls-summary', name: 'API Calls Summary' },
    { cols: 2, rows: 1, x: 1, y: 2, type: 'asset-uploads-count', name: 'Asset Uploads Count Chart' },
    { cols: 1, rows: 1, x: 2, y: 2, type: 'asset-uploads-size-summary', name: 'Asset Uploads Size Chart' },

    { cols: 2, rows: 1, x: 0, y: 3, type: 'asset-uploads-size', name: 'Asset Total Storage Size' },
    { cols: 2, rows: 1, x: 2, y: 3, type: 'api-traffic', name: 'API Traffic Chart' },

    { cols: 2, rows: 1, x: 0, y: 4, type: 'history', name: 'History' }
];