{
    'name': 'Gate & Turnstile Management',
    'version': '1.0.0',
    'category': 'Human Resources',
    'summary': 'Kapı ve Turnike Tanımlama, Yetkilendirme ve Geçiş Kontrol Yönetimi',
    'depends': ['base', 'hr'],
    'data': [
        'security/ir.model.access.csv',
        'views/gate_views.xml',
        'views/hr_employee_views.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
