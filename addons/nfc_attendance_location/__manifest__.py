{
    'name': 'NFC Attendance Location',
    'version': '1.0.0',
    'category': 'Human Resources',
    'summary': 'Girişin hangi çalışma yerinden (okutulan NFC kartın yeri) yapıldığını kaydeder',
    'depends': ['hr_attendance'],
    'data': [
        'views/hr_attendance_views.xml',
    ],
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
