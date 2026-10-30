# -*- coding: utf-8 -*-
{
    'name': 'Gate Access & NFC Management',
    'version': '1.1.1',
    'summary': 'Turnike ve NFC Kart Yönetim Sistemi',
    'author': 'Digifirma',
    'category': 'Human Resources',
    'depends': ['base', 'hr'],
    'data': [
        'security/ir.model.access.csv',
        'views/gate_views.xml',
        'views/hr_employee_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'nfc_gate_access/static/src/js/card_writer.js',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
