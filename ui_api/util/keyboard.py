from ui_api.util.constants import CYRILLIC_TO_LATIN_KEYBOARD, LATIN_TO_CYRILLIC_KEYBOARD, \
    LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP, LATIN_ALPHABET, CYRILLIC_ALPHABET, MULTIPLE_LATIN_CHARTS, \
    CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP


class KeyBoardUtils(object):
    @staticmethod
    def replace_by_map(str_, replace_map):
        result = u''
        for ch in str_:
            result += replace_map.get(ch, ch)
        return result

    @staticmethod
    def replace_by_alphabet(str_, src_alphabet, to_alphabet):
        for idx, ch in enumerate(src_alphabet):
            str_ = str_.replace(ch, to_alphabet[idx])
        return str_

    @classmethod
    def to_cyrillic_keyboard(cls, str_):
        return cls.replace_by_map(str_, LATIN_TO_CYRILLIC_KEYBOARD)

    @classmethod
    def to_latin_keyboard(cls, str_):
        return cls.replace_by_map(str_, CYRILLIC_TO_LATIN_KEYBOARD)

    @classmethod
    def get_prefixes_variables(cls, prefix):
        prefix = prefix.decode('utf-8')
        variants = []
        variants.extend(cls.latin_to_cyrillic_variants(prefix))
        variants.extend(cls.cyrillic_to_latin_variants(prefix))

        cyrillic_keyboard = cls.to_cyrillic_keyboard(prefix)
        latin_keyboard = cls.to_latin_keyboard(prefix)

        variants.extend(cls.latin_to_cyrillic_variants(latin_keyboard))
        variants.extend(cls.cyrillic_to_latin_variants(cyrillic_keyboard))

        variants = set(variants)

        variants.add(cyrillic_keyboard)
        variants.add(latin_keyboard)

        variants = list(variants)

        return variants

    @classmethod
    def _extend_latin_to_cyrillic_variants(cls, str_):
        last_char = str_[-1]
        variants = [str_]
        chart_variants = MULTIPLE_LATIN_CHARTS.get(last_char, None)
        if chart_variants:
            variants = []
            for variant in chart_variants:
                variants.append(str_[-1] + variant)
        return variants

    @classmethod
    def latin_to_cyrillic_variants(cls, str_):
        keys = LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP.keys()
        keys.sort(key=lambda x: len(x))
        for ch in keys:
            str_ = str_.replace(ch, LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[ch])
        variants = cls._extend_latin_to_cyrillic_variants(str_)
        variants = map(lambda x: cls.replace_by_alphabet(x, LATIN_ALPHABET, CYRILLIC_ALPHABET), variants)
        return variants

    @classmethod
    def cyrillic_to_latin_variants(cls, str_):
        keys = CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP.keys()
        keys.sort(key=lambda x: len(x))
        for ch in keys:
            str_ = str_.replace(ch, CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[ch])
        str_ = cls.replace_by_alphabet(str_, CYRILLIC_ALPHABET, LATIN_ALPHABET)
        return [str_]
