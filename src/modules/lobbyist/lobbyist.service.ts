import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LobbyistService {
  private readonly logger = new Logger(LobbyistService.name);
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async getMinutes(lobbyistId: string) {
    return this.prisma.minute.findMany({
      where: { lobbyistId },
      orderBy: { date: 'desc' },
    });
  }

  async getAllMinutes() {
    return this.prisma.minute.findMany({
      include: { lobbyist: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async createMinute(dto: {
    entity: string;
    subject: string;
    date: string;
    participants: string[];
    agreements: { text: string; responsible: string; deadline?: string }[];
    alertDate?: string;
    lobbyistId: string;
  }) {
    return this.prisma.minute.create({
      data: {
        entity: dto.entity,
        subject: dto.subject,
        date: new Date(dto.date),
        participants: dto.participants as any,
        agreements: dto.agreements as any,
        alertDate: dto.alertDate ? new Date(dto.alertDate) : undefined,
        lobbyistId: dto.lobbyistId,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.minute.update({
      where: { id },
      data: { status },
    });
  }

  async getTrackingTable() {
    const minutes = await this.prisma.minute.findMany({
      include: { lobbyist: { select: { name: true } } },
      orderBy: [{ status: 'asc' }, { alertDate: 'asc' }],
    });

    return minutes.map(m => {
      const agreements = (m.agreements as any[]) ?? [];
      const daysToAlert = m.alertDate
        ? Math.ceil((new Date(m.alertDate).getTime() - Date.now()) / 86400000)
        : null;

      return {
        id: m.id,
        entity: m.entity,
        subject: m.subject,
        date: m.date,
        status: m.status,
        alertDate: m.alertDate,
        daysToAlert,
        urgent: daysToAlert !== null && daysToAlert <= 3,
        agreementCount: agreements.length,
        pendingAgreements: agreements.filter((a: any) => !a.completed).length,
        lobbyist: m.lobbyist.name,
      };
    });
  }

  // ── Cron diario: revisar alertas de minutas ───────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkAlerts() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 3); // alertar 3 días antes

    const pending = await this.prisma.minute.findMany({
      where: {
        alertDate: { lte: threshold },
        status: 'PENDING',
        alertSent: false,
      },
      include: { lobbyist: { select: { email: true, name: true } } },
    });

    for (const minute of pending) {
      await this._sendAlert(minute);
      await this.prisma.minute.update({
        where: { id: minute.id },
        data: { alertSent: true },
      });
    }

    this.logger.log(`Alertas de minutas: ${pending.length} enviadas.`);
  }

  private async _sendAlert(minute: any) {
    const from = this.config.get<string>('EMAIL_FROM');
    const agreements = (minute.agreements as any[]) ?? [];

    await this.transporter.sendMail({
      from,
      to: minute.lobbyist.email,
      subject: `[ATOM Lobby] Alerta: Minuta vence pronto — ${minute.entity}`,
      html: `
        <h2>Recordatorio de Minuta</h2>
        <table border="1" cellpadding="6">
          <tr><th>Entidad</th><td>${minute.entity}</td></tr>
          <tr><th>Asunto</th><td>${minute.subject}</td></tr>
          <tr><th>Fecha reunión</th><td>${new Date(minute.date).toLocaleDateString('es-CL')}</td></tr>
          <tr><th>Alerta</th><td>${minute.alertDate ? new Date(minute.alertDate).toLocaleDateString('es-CL') : '—'}</td></tr>
        </table>
        <h3>Acuerdos pendientes (${agreements.filter((a: any) => !a.completed).length})</h3>
        <ul>
          ${agreements.filter((a: any) => !a.completed).map((a: any) => `<li>${a.text} — Responsable: ${a.responsible}</li>`).join('')}
        </ul>
      `,
    });
  }
}
