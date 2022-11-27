/** @type {import('next-translate').I18nConfig} */
const config = {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    pages: { '*': ['common', 'defenseRoll', 'spellList', 'dmScreen'] },
    defaultNS: 'common',
    logger: (...args) => {},
};
module.exports = config;
