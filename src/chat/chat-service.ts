// src/chat/chat.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
    private readonly model: string;
    private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY','AIzaSyBx4vtrBL3yAX4x7-cA0pvofFut5idU6Dg');
  }

  async sendToGemini(userMessage: string): Promise<string> {
    if (!this.apiKey) {
      this.logger.error('GEMINI_API_KEY is not set in environment');
      throw new InternalServerErrorException('AI key not configured on server');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model,
    )}:generateContent`;

    // REST request body follows Gemini generateContent example:
    // { contents: [ { parts: [ { text: "your prompt" } ] } ] }
    const payload = {
      contents: [
        {parts: [{text: userMessage}]},
      ],
    };

    try {
      const resp = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          // Google expects the API key in x-goog-api-key for these endpoints
          'x-goog-api-key': this.apiKey,
        },
        timeout: 20000,
      });

      // Response shape (per docs) -> data.candidates[0].content.parts[0].text
      const data = resp.data;
      const candidate =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.text; // fallback attempt

      if (!candidate) {
        this.logger.error('Unexpected Gemini response shape', JSON.stringify(data));
        throw new InternalServerErrorException('Invalid response from LLM');
      }

      return candidate;
    } catch (err: any) {
      this.logger.error('Gemini API call failed', err?.response?.data ?? err.message);
      throw new InternalServerErrorException('Failed to get response from LLM');
    }
  }
}
