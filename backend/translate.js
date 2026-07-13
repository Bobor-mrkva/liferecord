const { Translator } = require('deepl-node');

const key = process.env.DEEPL_API_KEY;
const translator = key ? new Translator(key) : null;

const DEEPL_TARGET_LANG = { en: 'EN-US', fr: 'FR', es: 'ES', de: 'DE', zh: 'ZH', hu: 'HU' };
const DEEPL_SOURCE_LANG = { en: 'EN', fr: 'FR', es: 'ES', de: 'DE', zh: 'ZH', hu: 'HU' };

const translateText = async (text, sourceLang, targetLang) => {
  if (!text) return text;
  const result = await translator.translateText(text, DEEPL_SOURCE_LANG[sourceLang], DEEPL_TARGET_LANG[targetLang]);
  return result.text;
};

const translateStoryFields = translator
  ? async (story, answers, targetLang) => {
      const [title, content] = await Promise.all([
        translateText(story.title, story.language, targetLang),
        story.content ? translateText(story.content, story.language, targetLang) : null,
      ]);
      const translatedAnswers = await Promise.all(
        answers.map(async (a) => ({
          question_id: a.question_id,
          answer: await translateText(a.answer, story.language, targetLang),
        }))
      );
      return { title, content, answers: translatedAnswers };
    }
  : null;

const translatePrompt = translator ? (prompt, targetLang) => translateText(prompt, 'en', targetLang) : null;

module.exports = { translateStoryFields, translatePrompt };
