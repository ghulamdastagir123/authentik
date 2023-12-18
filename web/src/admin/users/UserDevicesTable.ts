import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { deviceTypeName } from "@goauthentik/common/labels";
import "@goauthentik/elements/forms/DeleteBulkForm";
import { PaginatedResponse } from "@goauthentik/elements/table/Table";
import { Table, TableColumn } from "@goauthentik/elements/table/Table";

import { msg } from "@lit/localize";
import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AuthenticatorsApi, Device } from "@goauthentik/api";

@customElement("ak-user-device-table")
export class UserDeviceTable extends Table<Device> {
    @property({ type: Number })
    userId?: number;

    checkbox = true;

    async apiEndpoint(): Promise<PaginatedResponse<Device>> {
        return new AuthenticatorsApi(DEFAULT_CONFIG)
            .authenticatorsAdminAllList({
                user: this.userId,
            })
            .then((res) => {
                return {
                    pagination: {
                        count: res.length,
                        current: 1,
                        totalPages: 1,
                        startIndex: 1,
                        endIndex: res.length,
                        next: 0,
                        previous: 0,
                    },
                    results: res,
                };
            });
    }

    columns(): TableColumn[] {
        // prettier-ignore
        return [
            msg("Name"),
            msg("Type"),
            msg("Confirmed")
        ].map((th) => new TableColumn(th, ""));
    }

    async deleteWrapper(device: Device) {
        const api = new AuthenticatorsApi(DEFAULT_CONFIG);
        switch (device.type.toLowerCase()) {
            case "authentik_stages_authenticator_duo.duodevice":
                return api.authenticatorsAdminDuoDestroy({ id: parseInt(device.pk, 10) });
            case "authentik_stages_authenticator_sms.smsdevice":
                return api.authenticatorsAdminSmsDestroy({ id: parseInt(device.pk, 10) });
            case "authentik_stages_authenticator_totp.totpdevice":
                return api.authenticatorsAdminTotpDestroy({ id: parseInt(device.pk, 10) });
            case "authentik_stages_authenticator_static.staticdevice":
                return api.authenticatorsAdminStaticDestroy({ id: parseInt(device.pk, 10) });
            case "authentik_stages_authenticator_webauthn.webauthndevice":
                return api.authenticatorsAdminWebauthnDestroy({ id: parseInt(device.pk, 10) });
            case "authentik_stages_authenticator_mobile.mobiledevice":
                return api.authenticatorsMobileDestroy({
                    uuid: device.pk,
                });
            default:
                break;
        }
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${msg("Device(s)")}
            .objects=${this.selectedElements}
            .delete=${(item: Device) => {
                return this.deleteWrapper(item);
            }}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${msg("Delete")}
            </button>
        </ak-forms-delete-bulk>`;
    }

    renderToolbar(): TemplateResult {
        return html` <ak-spinner-button
            .callAction=${() => {
                return this.fetch();
            }}
            class="pf-m-secondary"
        >
            ${msg("Refresh")}</ak-spinner-button
        >`;
    }

    row(item: Device): TemplateResult[] {
        return [
            html`${item.name}`,
            html`${deviceTypeName(item)}`,
            html`${item.confirmed ? msg("Yes") : msg("No")}`,
        ];
    }
}
