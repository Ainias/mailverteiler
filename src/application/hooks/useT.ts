import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';
import { useMemo } from 'react';

export function useT(key?: string): { t: Translate; lang: string } {
    const { t: _t, lang } = useTranslation(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const t = useMemo(() => _t, [lang]);
    return { t, lang };
}
