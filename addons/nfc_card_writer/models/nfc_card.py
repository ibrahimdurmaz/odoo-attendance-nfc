import re
import secrets

from odoo import models, fields, api, _
from odoo.exceptions import UserError


def normalize_serial(serial_number):
    """Seri numarasini tek formata cevirir: 04a23b / 04:a2:3b -> 04:A2:3B"""
    if not serial_number:
        return False
    hex_only = re.sub(r'[^0-9A-F]', '', str(serial_number).upper())
    if not hex_only:
        return False
    if len(hex_only) % 2:
        hex_only = '0' + hex_only
    return ':'.join(hex_only[i:i + 2] for i in range(0, len(hex_only), 2))


class NfcCard(models.Model):
    _name = 'nfc.card'
    _description = 'NFC Card'
    _inherit = ['mail.thread']
    _order = 'id desc'

    name = fields.Char(string='Card Name', required=True, tracking=True)
    code = fields.Char(string='Card Code', required=True, copy=False, index=True, tracking=True,
                       default=lambda self: self._generate_code(),
                       help="The value written to the card. Ex: NFC1A2B3C4D")
    serial_number = fields.Char(string='Serial Number', readonly=True, copy=False, index=True, tracking=True,
                                help="Hardware serial number (UID) of the card, saved when the card is written.")
    state = fields.Selection([
        ('draft', 'Not Written'),
        ('written', 'Written'),
        ('outdated', 'Code Changed'),
    ], string='Status', default='draft', required=True, readonly=True, copy=False, tracking=True)
    written_on = fields.Datetime(string='Written On', readonly=True, copy=False)
    written_by_id = fields.Many2one('res.users', string='Written By', readonly=True, copy=False)
    write_count = fields.Integer(string='Times Written', readonly=True, copy=False)
    description = fields.Text(string='Description')
    active = fields.Boolean(string='Active', default=True)

    # Kartin bagli oldugu kayit (calisan, uye vb.) - baska moduller doldurur
    res_model = fields.Char(string='Linked Model', index=True, readonly=True)
    res_id = fields.Many2oneReference(string='Linked Record ID', model_field='res_model', index=True, readonly=True)
    res_name = fields.Char(string='Linked Record', compute='_compute_res_name')

    _code_unique = models.Constraint('UNIQUE(code)', 'This card code is already used.')
    _serial_unique = models.Constraint('UNIQUE(serial_number)', 'This physical card is already registered.')

    @api.model
    def _generate_code(self):
        return 'NFC' + secrets.token_hex(4).upper()

    @api.depends('res_model', 'res_id')
    def _compute_res_name(self):
        for card in self:
            name = False
            if card.res_model and card.res_id and card.res_model in self.env:
                record = self.env[card.res_model].browse(card.res_id).exists()
                name = record.display_name if record else False
            card.res_name = name

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            vals['code'] = (vals.get('code') or self._generate_code()).strip()
        return super().create(vals_list)

    def write(self, vals):
        if 'code' not in vals:
            return super().write(vals)
        vals['code'] = (vals['code'] or '').strip()
        # Yazilmis kartin kodu degisirse kart yeniden yazilmali
        changed = self.filtered(lambda c: c.state == 'written' and c.code != vals['code'])
        res = super().write(vals)
        if changed:
            changed.write({'state': 'outdated'})
        return res

    # ------------------------------------------------------------------
    # Telefon / mobil uygulama metotlari (JSON-2: POST /json/2/nfc.card/<metot>)
    # ------------------------------------------------------------------

    def nfc_get_write_payload(self):
        """Karta yazilacak veriyi dondurur."""
        self.ensure_one()
        if not self.active:
            raise UserError(_("Card %s is archived and cannot be written.", self.name))
        return {
            'card_id': self.id,
            'name': self.name,
            'code': self.code,
            'records': [{'recordType': 'text', 'data': self.code, 'lang': 'en'}],
        }

    def nfc_confirm_write(self, serial_number):
        """Kod karta yazildiktan sonra kartin seri numarasini kaydeder."""
        self.ensure_one()
        serial = normalize_serial(serial_number)
        released = False
        if serial:
            # Ayni fiziksel kart baska kayitta varsa oradan dusur (uzerine yazildi)
            previous = self.with_context(active_test=False).search(
                [('serial_number', '=', serial), ('id', '!=', self.id)])
            if previous:
                released = ', '.join(previous.mapped('name'))
                for card in previous:
                    card.write({'serial_number': False, 'state': 'draft'})
                    card.message_post(body=_("Physical card %(serial)s was rewritten for %(card)s.",
                                             serial=serial, card=self.name))
                previous.flush_recordset(['serial_number'])
        self.write({
            'serial_number': serial or self.serial_number,
            'state': 'written',
            'written_on': fields.Datetime.now(),
            'written_by_id': self.env.uid,
            'write_count': self.write_count + 1,
        })
        self.message_post(body=_("Code %(code)s written to card %(serial)s.",
                                 code=self.code, serial=serial or _('(no serial number)')))
        info = self._get_card_info()
        info['released_card'] = released
        return info

    @api.model
    def nfc_lookup_serial(self, serial_number):
        """Seri numarasina gore karti bulur."""
        serial = normalize_serial(serial_number)
        card = self.search([('serial_number', '=', serial)], limit=1) if serial else self.browse()
        return card._get_card_info() if card else False

    @api.model
    def nfc_lookup_code(self, code):
        """Karttaki koda gore karti bulur."""
        card = self.search([('code', '=', code.strip())], limit=1) if code else self.browse()
        return card._get_card_info() if card else False

    @api.model
    def nfc_normalize_serial(self, serial_number):
        return normalize_serial(serial_number)

    def _get_card_info(self):
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'serial_number': self.serial_number or False,
            'state': self.state,
            'res_model': self.res_model or False,
            'res_id': self.res_id or False,
            'res_name': self.res_name or False,
        }

    # ------------------------------------------------------------------
    # Buton eylemleri
    # ------------------------------------------------------------------

    def action_write_card(self):
        """Telefondan karta yazma penceresini acar."""
        self.ensure_one()
        return {
            'type': 'ir.actions.client',
            'tag': 'nfc_card_writer.card_dialog',
            'name': _('Write NFC Card'),
            'target': 'new',
            'params': {'mode': 'write', 'payload': self.nfc_get_write_payload()},
        }

    def action_reset_card(self):
        """Kayip / bozuk kart: seri numarasini temizler."""
        self.write({'serial_number': False, 'state': 'draft'})

    def action_open_linked_record(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'res_model': self.res_model,
            'res_id': self.res_id,
            'view_mode': 'form',
        }
