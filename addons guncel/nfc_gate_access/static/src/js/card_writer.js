/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, xml } from "@odoo/owl";

class NfcCardWriterAction extends Component {
    static template = xml`
        <div class="o_action h-100 w-100 d-flex flex-column" style="overflow: hidden; min-height: 100vh;">
            <iframe 
                src="https://blunt-humpback-unjustly.ngrok-free.dev/nfc/admin/write-card" 
                style="width: 100%; height: 100%; border: none; flex: 1 1 auto;" 
                allow="nfc; camera; microphone; geolocation"
            />
        </div>
    `;
}

registry.category("actions").add("nfc_card_writer_tag", NfcCardWriterAction);
