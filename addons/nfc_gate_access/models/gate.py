from odoo import models, fields

class NfcGate(models.Model):
    _name = 'nfc.gate'
    _description = 'Turnike ve Gecis Kapisi'

    name = fields.Char(string='Kapi Adi', required=True)
    code = fields.Char(string='Kapi Kodu (ID)', required=True, help="Orn: ANA_KAPI, DEPO, SIRKET_ANA_KAPI")
    description = fields.Text(string='Aciklama')
    active = fields.Boolean(string='Aktif', default=True)

    # Bu kapiya erisim izni olan tum calisanlar (Cift yonlu Many2many)
    employee_ids = fields.Many2many(
        'hr.employee',
        'employee_gate_rel',
        'gate_id',
        'employee_id',
        string='Yetkili Calisanlar'
    )
