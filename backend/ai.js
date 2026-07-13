const Groq = require('groq-sdk');

const key = process.env.GROQ_API_KEY;
const client = key ? new Groq({ apiKey: key }) : null;

const MODEL = 'llama-3.3-70b-versatile';

const firstText = (completion) => (completion.choices[0].message.content || '').trim();

const getWritingAssistance = client
  ? async (draftText) => {
      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `The following is someone's in-progress life story or reflection, written in their own voice. Suggest 2-3 sentences that could naturally continue it. Match their tone and voice. Return only the suggested continuation text, no preamble or quotation marks.\n\n---\n${draftText}`,
          },
        ],
      });
      return firstText(completion);
    }
  : null;

const reorderStoryContent = client
  ? async (content) => {
      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `The following is someone's life story, written in their own words. People telling their life story often jump around in time instead of telling it in order. Rewrite it so the events are told in chronological order (earliest to latest), keeping the author's own words, voice, and details as unchanged as possible - only reorganize the order events are told in, do not add commentary or change the meaning. Return only the rewritten story text, no preamble.\n\n---\n${content}`,
          },
        ],
      });
      return firstText(completion);
    }
  : null;

const cleanupTranscript = client
  ? async (rawText) => {
      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `The following text was transcribed automatically from spoken voice input. The speaker may be elderly and may speak slowly, pause, or trail off, which can cause the automatic transcription to mishear words or produce garbled phrases. Clean up likely transcription errors, fix punctuation and sentence breaks, and remove filler/false starts, while keeping the speaker's own words, meaning, and voice as unchanged as possible. Do not add any new content. Return only the cleaned text, no preamble.\n\n---\n${rawText}`,
          },
        ],
      });
      return firstText(completion);
    }
  : null;

module.exports = { getWritingAssistance, reorderStoryContent, cleanupTranscript };
