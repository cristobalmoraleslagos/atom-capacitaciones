import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as xlsx from 'xlsx';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

const KEYWORDS = [
  'capacitación', 'capacitacion', 'coaching', 'liderazgo',
  'recursos humanos', 'formación', 'formacion', 'entrenamiento',
  'habilidades blandas', 'desarrollo organizacional',
];

@Injectable()
export class MercadoPublicoService {
  private readonly logger = new Logger(MercadoPublicoService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  // ── Cron 9:00 y 15:00 lunes–viernes ─────────────────────────────────────

  @Cron('0 9,15 * * 1-5')
  async procesarLicitacionesDiarias() {
    this.logger.log('Worker Mercado Público iniciado...');
    try {
      const nuevas = await this._fetchYFiltrar();
      if (nuevas.length > 0) {
        await this._guardarLicitaciones(nuevas);
        const buffer = this._generarExcel(nuevas);
        await this._enviarEmail(buffer, nuevas.length);
        this.logger.log(`${nuevas.length} licitaciones nuevas notificadas.`);
      } else {
        this.logger.log('Sin licitaciones nuevas en esta ejecución.');
      }
    } catch (err) {
      this.logger.error('Error en worker Mercado Público:', err.message);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────

  async getTenders(status?: string) {
    return this.prisma.tender.findMany({
      where: status ? { status } : undefined,
      orderBy: { publishDate: 'desc' },
    });
  }

  async runManual() {
    const nuevas = await this._fetchYFiltrar();
    if (nuevas.length > 0) {
      await this._guardarLicitaciones(nuevas);
    }
    return { found: nuevas.length, tenders: nuevas };
  }

  exportExcel(tenders: any[]): Buffer {
    return this._generarExcel(tenders);
  }

  // ── Privados ──────────────────────────────────────────────────────────────

  private async _fetchYFiltrar() {
    const ticket = this.config.get<string>('MERCADO_PUBLICO_TICKET');
    const today = new Date().toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '-');

    const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=${today}&ticket=${ticket}`;
    const response = await firstValueFrom(this.httpService.get(url, { timeout: 15000 }));
    const listado: any[] = response.data?.Listado ?? [];

    // Filtrar por keywords y excluir ya guardadas
    const existentes = await this.prisma.tender.findMany({
      select: { externalId: true },
    });
    const existentesSet = new Set(existentes.map(e => e.externalId));

    return listado
      .filter(lic => {
        const nombre = (lic.Nombre ?? '').toLowerCase();
        return KEYWORDS.some(kw => nombre.includes(kw));
      })
      .filter(lic => !existentesSet.has(lic.CodigoExterno))
      .map(lic => ({
        externalId: lic.CodigoExterno,
        name: lic.Nombre,
        entity: lic.NombreOrganismo ?? '',
        type: lic.Tipo ?? '',
        status: lic.Estado ?? 'Activo',
        amount: lic.MontoEstimado ? parseFloat(lic.MontoEstimado) : null,
        publishDate: lic.FechaPublicacion ? new Date(lic.FechaPublicacion) : new Date(),
        closeDate: lic.FechaCierre ? new Date(lic.FechaCierre) : null,
        url: lic.urlDireccion ?? null,
        keywords: KEYWORDS.filter(kw => (lic.Nombre ?? '').toLowerCase().includes(kw)),
      }));
  }

  private async _guardarLicitaciones(licitaciones: any[]) {
    await this.prisma.tender.createMany({
      data: licitaciones.map(l => ({ ...l, keywords: l.keywords as any })),
      skipDuplicates: true,
    });
  }

  private _generarExcel(data: any[]): Buffer {
    const rows = data.map(l => ({
      'Código': l.externalId,
      'Nombre': l.name,
      'Organismo': l.entity,
      'Tipo': l.type,
      'Estado': l.status,
      'Monto Estimado': l.amount,
      'Fecha Publicación': l.publishDate ? new Date(l.publishDate).toLocaleDateString('es-CL') : '',
      'Fecha Cierre': l.closeDate ? new Date(l.closeDate).toLocaleDateString('es-CL') : '',
      'URL': l.url,
    }));

    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Licitaciones_ATOM');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  private async _enviarEmail(excelBuffer: Buffer, count: number) {
    const to = this.config.get<string>('EMAIL_ALERT_TO');
    const from = this.config.get<string>('EMAIL_FROM');
    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    await this.transporter.sendMail({
      from,
      to,
      subject: `[ATOM] ${count} Licitaciones nuevas — ${hora}`,
      html: `
        <h2>ATOM Capacitaciones — Alerta Licitaciones</h2>
        <p>Se encontraron <strong>${count} licitaciones nuevas</strong> en Mercado Público que coinciden con nuestro rubro.</p>
        <p>Se adjunta el detalle en Excel.</p>
        <hr>
        <small>Este correo fue generado automáticamente a las ${hora}.</small>
      `,
      attachments: [
        { filename: `licitaciones_atom_${new Date().toISOString().slice(0, 10)}.xlsx`, content: excelBuffer },
      ],
    });
  }
}
