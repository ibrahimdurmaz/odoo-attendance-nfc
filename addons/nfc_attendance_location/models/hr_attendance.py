from odoo import api, fields, models


class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    # Uygulama, okutulan kartın yerini girişten hemen önce çalışanın çalışma yeri yapar;
    # giriş kaydı oluşurken o an seçili olan yer buraya yazılır.
    work_location_id = fields.Many2one('hr.work.location', string='Work Location', index=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('work_location_id') or not vals.get('employee_id'):
                continue
            employee = self.env['hr.employee'].sudo().browse(vals['employee_id'])
            vals['work_location_id'] = employee.work_location_id.id
        return super().create(vals_list)
