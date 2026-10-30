# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class NfcGate(models.Model):
    _name = 'nfc.gate'
    _description = 'Turnike ve Kapi Yonetimi'

    name = fields.Char(string="Kapi Adi", required=True)
    code = fields.Char(string="Kapi Kodu (ID)", required=True, index=True)
    nfc_card_id = fields.Char(string="Tanimli NFC Kart/Etiket ID", index=True, copy=False)
    active = fields.Boolean(string="Aktif", default=True)
    employee_ids = fields.Many2many(
        'hr.employee',
        'gate_employee_rel',
        'gate_id',
        'employee_id',
        string="Yetkili Personeller"
    )

    @api.constrains('nfc_card_id')
    def _check_unique_nfc_card_id(self):
        for record in self:
            if record.nfc_card_id:
                clean_uid = record.nfc_card_id.strip()
                duplicate = self.search([
                    ('id', '!=', record.id),
                    ('nfc_card_id', '=ilike', clean_uid)
                ])
                if duplicate:
                    raise ValidationError(
                        f"Bu NFC Kart ID ({clean_uid}) zaten '{duplicate[0].name}' kapısına atanmış! "
                        "Bir kart aynı anda sadece tek bir kapıya atanabilir."
                    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('code'):
                vals['code'] = vals['code'].strip().upper()
        return super().create(vals_list)
