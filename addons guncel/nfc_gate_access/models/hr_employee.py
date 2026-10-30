# -*- coding: utf-8 -*-
from odoo import models, fields

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    locked_device_id = fields.Char(string="Kayıtlı Cihaz ID", copy=False)
    x_device_uuid = fields.Char(string="Kayıtlı Cihaz UUID", copy=False)
    allowed_gate_ids = fields.Many2many(
        'nfc.gate',
        'gate_employee_rel',
        'employee_id',
        'gate_id',
        string="İzin Verilen Kapılar"
    )
