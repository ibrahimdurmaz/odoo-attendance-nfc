import { Component, onWillUnmount, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * Write / read an NFC card from the phone with the Web NFC API.
 *
 * Web NFC is available in Chrome on Android, over HTTPS only.
 * - mode "write": waits for a card, reads its serial number, writes the
 *   payload records and reports the serial number to nfc.card.
 * - mode "read":  shows the serial number + content of a card and the
 *   matching nfc.card record.
 */
export class NfcCardDialog extends Component {
    static template = "nfc_card_writer.NfcCardDialog";
    static components = { Dialog };
    static props = {
        close: Function,
        mode: { type: String },
        payload: { type: Object, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.state = useState({
            // unsupported | idle | waiting | busy | done | error
            status: this.isSupported ? "idle" : "unsupported",
            message: "",
            serial: "",
            records: [],
            card: null,
            releasedCard: false,
        });
        this.abortController = null;
        this.busy = false;
        onWillUnmount(() => this.stopScan());
    }

    get isWrite() {
        return this.props.mode === "write";
    }

    get isSupported() {
        return "NDEFReader" in window && window.isSecureContext;
    }

    get title() {
        return this.isWrite ? _t("Write NFC Card") : _t("Read NFC Card");
    }

    get stateLabels() {
        return { draft: _t("Not Written"), written: _t("Written"), outdated: _t("Code Changed") };
    }

    async start() {
        this.stopScan();
        this.busy = false;
        Object.assign(this.state, {
            status: "waiting",
            message: "",
            serial: "",
            records: [],
            card: null,
            releasedCard: false,
        });
        this.abortController = new AbortController();
        const reader = new window.NDEFReader();
        reader.onreading = (event) => this.onReading(reader, event);
        reader.onreadingerror = () => {
            this.state.message = _t("The card could not be read. Hold it still and try again.");
        };
        try {
            // scan() must be called from a click: it triggers the NFC permission prompt.
            await reader.scan({ signal: this.abortController.signal });
        } catch (error) {
            this.fail(error);
        }
    }

    async onReading(reader, event) {
        if (this.busy) {
            return;
        }
        this.busy = true;
        this.state.status = "busy";
        this.state.serial = event.serialNumber || "";
        try {
            if (this.isWrite) {
                await this.writeCard(reader);
            } else {
                await this.readCard(event);
            }
            this.state.status = "done";
        } catch (error) {
            this.fail(error);
        } finally {
            this.stopScan();
        }
    }

    async writeCard(reader) {
        const payload = this.props.payload;
        await reader.write(
            { records: payload.records },
            { overwrite: true, signal: this.abortController.signal }
        );
        const result = await this.orm.call("nfc.card", "nfc_confirm_write", [
            [payload.card_id],
            this.state.serial || false,
        ]);
        this.state.card = result;
        this.state.serial = result.serial_number || this.state.serial;
        this.state.releasedCard = result.released_card;
        if (!this.state.serial) {
            this.state.message = _t(
                "The code was written, but this card does not report a serial number."
            );
        }
    }

    async readCard(event) {
        this.state.records = event.message.records.map((record) => ({
            type: record.recordType,
            value: this.decodeRecord(record),
        }));
        let card = false;
        if (this.state.serial) {
            card = await this.orm.call("nfc.card", "nfc_lookup_serial", [this.state.serial]);
            this.state.serial = (await this.orm.call("nfc.card", "nfc_normalize_serial", [
                this.state.serial,
            ])) || this.state.serial;
        }
        if (!card) {
            const text = this.state.records.find((r) => r.type === "text");
            if (text && text.value) {
                card = await this.orm.call("nfc.card", "nfc_lookup_code", [text.value]);
            }
        }
        this.state.card = card || null;
    }

    decodeRecord(record) {
        if (!record.data) {
            return "";
        }
        if (["text", "url", "absolute-url"].includes(record.recordType)) {
            return new TextDecoder(record.encoding || "utf-8").decode(record.data);
        }
        if (record.mediaType && record.mediaType.startsWith("text/")) {
            return new TextDecoder().decode(record.data);
        }
        return _t("(%s bytes of binary data)", record.data.byteLength);
    }

    fail(error) {
        if (error && error.name === "AbortError") {
            return;
        }
        let message = (error && (error.data?.message || error.message)) || String(error);
        if (error && error.name === "NotAllowedError") {
            message = _t("NFC permission was denied. Allow NFC for this site in Chrome settings.");
        } else if (error && error.name === "NotSupportedError") {
            message = _t("NFC is not available. Make sure NFC is turned on in the phone settings.");
        } else if (error && error.name === "NetworkError") {
            message = _t("The card was moved away too early or cannot be written. Try again.");
        }
        this.state.status = "error";
        this.state.message = message;
        this.stopScan();
    }

    stopScan() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    cancel() {
        this.stopScan();
        this.props.close();
    }
}

function nfcCardDialogAction(env, action) {
    const params = action.params || {};
    return new Promise((resolve) => {
        env.services.dialog.add(
            NfcCardDialog,
            { mode: params.mode || "read", payload: params.payload },
            { onClose: () => resolve({ type: "ir.actions.act_window_close" }) }
        );
    });
}

registry.category("actions").add("nfc_card_writer.card_dialog", nfcCardDialogAction);
