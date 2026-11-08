# AI.MALDIVES

A responsive, ChatGPT-style AI web app with text chat, image generation, document uploads and browser voice input/read-aloud.

## What is included
- Responsive dark interface branded **AI.MALDIVES**
- Text chat powered by the OpenAI Responses API
- Image generation powered by the OpenAI Images API
- Upload and extract text from PDF, DOCX, TXT, Markdown, CSV, JSON and code/text files
- Browser speech-to-text (where supported) and double-click an assistant reply to read it aloud
- Server-side API key handling (the key is never sent to the browser)

## Requirements
- Node.js 20+
- An OpenAI API key with API billing enabled

## Run locally
1. Unzip the project.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your API key in `.env`:
   `OPENAI_API_KEY=your_api_key_here`
6. Run `npm start`.
7. Open http://localhost:3000

Never commit or share your `.env` file. Keep your API key private.

## Publish it so others can use a link
Deploy this folder to a Node.js hosting provider (for example Render, Railway, or a VPS):
- Create a new web service from this project/repository.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variable `OPENAI_API_KEY` in the host's private environment-variable settings.
- Optional: set `OPENAI_CHAT_MODEL` or `OPENAI_IMAGE_MODEL`.
- Deploy. The host will provide a public HTTPS URL you can share.

You must create/own the hosting account and supply your own API key. I cannot publish under your identity or create a live public URL without access to your hosting account.

## Environment variables
- `OPENAI_API_KEY` required
- `PORT` optional (default 3000)
- `OPENAI_CHAT_MODEL` optional (default `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` optional (default `gpt-image-1`)

## Important notes
- The included voice feature uses browser speech recognition and speech synthesis. Recognition support varies by browser/device; Chrome generally has the best support. This is browser-based voice input and read-aloud, not a real-time two-way audio model.
- Uploaded files are processed in memory and not saved by this app. Uploaded text is sent to the configured AI API when you ask a question about it.
- This starter app has no user login, persistent server-side chat history, rate limiting, moderation dashboard, or usage quotas. Add those before a large public launch to protect user privacy and prevent unexpected API costs.
- Generated image data is returned to the browser; download it if you want to keep it.
