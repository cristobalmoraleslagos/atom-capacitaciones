import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);
  private openai: OpenAI;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') });
  }

  // ── Métricas ──────────────────────────────────────────────────────────────

  async getMetrics() {
    const latest = await this.prisma.socialMetrics.findMany({
      distinct: ['platform'],
      orderBy: { createdAt: 'desc' },
    });
    return { metrics: latest };
  }

  async upsertMetrics(dto: {
    platform: string;
    followers: number;
    reach?: number;
    engagement?: number;
  }) {
    const prev = await this.prisma.socialMetrics.findFirst({
      where: { platform: dto.platform },
      orderBy: { createdAt: 'desc' },
    });

    const followersLastWeek = prev?.followers ?? dto.followers;
    const percentageGrowth =
      followersLastWeek > 0
        ? parseFloat((((dto.followers - followersLastWeek) / followersLastWeek) * 100).toFixed(2))
        : 0;

    return this.prisma.socialMetrics.create({
      data: {
        platform: dto.platform,
        followers: dto.followers,
        followersLastWeek,
        percentageGrowth,
        reach: dto.reach ?? 0,
        engagement: dto.engagement ?? 0,
      },
    });
  }

  // ── Campañas ──────────────────────────────────────────────────────────────

  async getCampaigns() {
    return this.prisma.campaign.findMany({ orderBy: { startDate: 'desc' } });
  }

  async createCampaign(dto: {
    name: string;
    platform: string;
    startDate: string;
    endDate?: string;
    budget?: number;
  }) {
    return this.prisma.campaign.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  // ── Contenido semanal (Cron + manual) ────────────────────────────────────

  async getWeeklyContent() {
    return this.prisma.weeklyContent.findMany({
      orderBy: { week: 'desc' },
      take: 8,
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async generarContenidoSemanal() {
    this.logger.log('Generando contenido semanal con IA...');
    return this._generarYGuardar();
  }

  async generarContenidoManual() {
    return this._generarYGuardar();
  }

  private async _generarYGuardar() {
    const metricas = await this.prisma.socialMetrics.findMany({
      distinct: ['platform'],
      orderBy: { createdAt: 'desc' },
    });

    const resumen = metricas
      .map(m => `${m.platform}: ${m.followers} seguidores (${m.percentageGrowth}% crecimiento)`)
      .join('; ');

    const prompt = `
Eres un experto en marketing digital para ATOM Capacitaciones, empresa chilena de capacitación corporativa y formación de competencias.
Métricas actuales — ${resumen || 'sin datos previos, primera semana'}.

Genera un plan de contenido semanal en JSON estricto con esta estructura:
{
  "tema_central": "string (tema principal de la semana)",
  "eslogan": "string (eslogan motivacional corto)",
  "frases": ["frase 1", "frase 2", "frase 3"],
  "temas_post": [
    { "dia": "Lunes", "plataforma": "LinkedIn", "titulo": "...", "descripcion_breve": "..." },
    { "dia": "Martes", "plataforma": "Instagram", "titulo": "...", "descripcion_breve": "..." },
    { "dia": "Jueves", "plataforma": "Facebook", "titulo": "...", "descripcion_breve": "..." },
    { "dia": "Viernes", "plataforma": "LinkedIn", "titulo": "...", "descripcion_breve": "..." }
  ]
}
Enfócate en capacitación, liderazgo, habilidades blandas, desarrollo profesional y cultura organizacional.
`.trim();

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const data = JSON.parse(completion.choices[0].message.content!);

    const saved = await this.prisma.weeklyContent.create({
      data: {
        week: new Date(),
        theme: data.tema_central,
        slogan: data.eslogan,
        phrases: data.frases,
        topics: data.temas_post,
      },
    });

    this.logger.log(`Contenido semanal generado: ${saved.id}`);
    return saved;
  }
}
