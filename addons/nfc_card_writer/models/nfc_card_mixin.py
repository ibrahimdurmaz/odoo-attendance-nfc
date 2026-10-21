from odoo import models, fields, api

from .nfc_card import normalize_serial


class NfcCardMixin(models.AbstractModel):
    """Baska modullerde herhangi bir modele NFC karti ekler.

    Ornek:
        class HrEmployee(models.Model):
            _name = 'hr.employee'
            _inherit = ['hr.employee', 'nfc.card.mixin']
    """
    _name = 'nfc.card.mixin'
    _description = 'NFC Card Mixin'

    nfc_card_id = fields.Many2one('nfc.card', string='NFC Card', copy=False, index=True, ondelete='set null')
    nfc_card_code = fields.Char(string='NFC Code', related='nfc_card_id.code')
    nfc_card_serial = fields.Char(string='NFC Serial Number', related='nfc_card_id.serial_number')
    nfc_card_state = fields.Selection(string='NFC Card Status', related='nfc_card_id.state')

    def _nfc_card_get_code(self):
        """Karta yazilacak kod. False = otomatik kod uretilir."""
        return False

    def action_nfc_write_card(self):
        """Kart yoksa olusturur ve yazma penceresini acar."""
        self.ensure_one()
        if not self.nfc_card_id:
            self.nfc_card_id = self.env['nfc.card'].create({
                'name': self.display_name,
                'code': self._nfc_card_get_code(),
                'res_model': self._name,
                'res_id': self.id,
            })
        return self.nfc_card_id.action_write_card()

    @api.model
    def nfc_find_by_serial(self, serial_number):
        serial = normalize_serial(serial_number)
        return self.search([('nfc_card_id.serial_number', '=', serial)], limit=1) if serial else self.browse()

    @api.model
    def nfc_find_by_code(self, code):
        return self.search([('nfc_card_id.code', '=', code.strip())], limit=1) if code else self.browse()
