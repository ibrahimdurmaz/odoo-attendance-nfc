{
    'name': 'NFC Card Writer',
    'version': '1.0.0',
    'category': 'Productivity',
    'summary': 'Write codes to NFC cards from a phone and register the card serial number',
    'depends': ['base', 'web', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/nfc_card_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'nfc_card_writer/static/src/nfc_card_dialog.js',
            'nfc_card_writer/static/src/nfc_card_dialog.xml',
            'nfc_card_writer/static/src/nfc_card_dialog.scss',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
