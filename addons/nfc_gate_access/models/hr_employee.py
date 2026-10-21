from odoo import models, fields

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    # Sabit booleanlar yerine kapı tablosundan seçilen dinamik çoklu seçim alanı
    allowed_gate_ids = fields.Many2many(
        'nfc.gate',
        'employee_gate_rel',
        'employee_id',
        'gate_id',
        string='Yetkili Kapılar'
    )
