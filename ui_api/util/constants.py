# coding=utf-8
LATIN_TO_CYRILLIC_KEYBOARD = {
    u'q': u'й',
    u'w': u'ц',
    u'e': u'у',
    u'r': u'к',
    u't': u'е',
    u'y': u'н',
    u'u': u'г',
    u'i': u'ш',
    u'o': u'щ',
    u'p': u'з',
    u'{': u'х',
    u'}': u'ъ',
    u'a': u'ф',
    u's': u'ы',
    u'd': u'в',
    u'f': u'а',
    u'g': u'п',
    u'h': u'р',
    u'j': u'о',
    u'k': u'л',
    u'l': u'д',
    u';': u'ж',
    u"'": u'э',
    u'z': u'я',
    u'x': u'ч',
    u'c': u'с',
    u'v': u'м',
    u'b': u'и',
    u'n': u'т',
    u'm': u'ь',
    u',': u'б',
    u'.': u'ю',
    u'/': u'.'
}

CYRILLIC_TO_LATIN_KEYBOARD = {value: key for key, value in LATIN_TO_CYRILLIC_KEYBOARD.iteritems()}

LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP = {
    u'yo': u'ё',
    u'zh': u'ж',
    u'kh': u'х',
    u'ts': u'ц',
    u'ch': u'ч',
    u'sch': u'щ',
    u'shch': u'щ',
    u'sh': u'ш',
    u'eh': u'э',
    u'yu': u'ю',
    u'ya': u'я',
    u"'": u'ь'
}

CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP = {value: key for key, value in LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP.iteritems()}

MULTIPLE_LATIN_CHARTS = {
    u'y': [u'ы', u'ё', u'ю', u'я'],
    u'z': [u'ж', u'з'],
    u'k': [u'х', u'к'],
    u't': [u'ц', u'т'],
    u'c': [u'ц', u'ч',  u'щ'],
    u's': [u'ш', u'щ', u'с'],
    u'e': [u'е', u'э']
}

LATIN_ALPHABET = u'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ'
CYRILLIC_ALPHABET = u'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ'
