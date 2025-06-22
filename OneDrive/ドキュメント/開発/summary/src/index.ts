import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env');
}

const app = express();
app.use(cors());
app.use(express.json());

// 最新SDKの正しい使い方に修正
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);


// 本文抽出ユーティリティ
async function extractMainText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article || !article.textContent) throw new Error('記事本文を抽出できませんでした');
  return article.textContent;
}

// Gemini で日本語1行要約
async function summarizeWithGemini(text: string): Promise<string> {
  // 最新SDKの仕様に合わせて修正
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
  const prompt = `次の文章を日本語で120文字以内で1行に要約してください。\n\n${text}`;
  const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  // 最新SDKでは result.response.text で取得できる場合もある
  let summary = '';
  if (result.response && result.response.candidates && result.response.candidates[0]?.content?.parts?.[0]?.text) {
    summary = result.response.candidates[0].content.parts[0].text.trim();
  } else if ((result as any).response?.text) {
    summary = (result as any).response.text.trim();
  }
  // 120文字以内に収める
  return summary.length > 120 ? summary.slice(0, 120) : summary;
}

// POST /summarize エンドポイント
app.post('/summarize', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }
  try {
    const mainText = await extractMainText(url);
    const summary = await summarizeWithGemini(mainText);
    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
