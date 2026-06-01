import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';

interface GradeEntry {
  label: string;
  score: number;
  weight: number;
}

@Injectable()
export class ProfessorService {
  constructor(private prisma: PrismaService) {}

  // ── Cursos ────────────────────────────────────────────────────────────────

  async getCourses(professorId: string) {
    return this.prisma.course.findMany({
      where: { professorId },
      include: { _count: { select: { grades: true, attendance: true } } },
    });
  }

  async createCourse(dto: {
    name: string;
    program?: string;
    totalHours: number;
    startDate?: string;
    endDate?: string;
    professorId: string;
  }) {
    return this.prisma.course.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  // ── Notas ─────────────────────────────────────────────────────────────────

  calculateFinalGrade(scores: GradeEntry[]): number {
    const total = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
    return parseFloat(total.toFixed(1));
  }

  async getGrades(courseId: string) {
    return this.prisma.grade.findMany({ where: { courseId } });
  }

  async saveGrade(dto: {
    studentId: string;
    studentName: string;
    scores: GradeEntry[];
    courseId: string;
  }) {
    const finalGrade = this.calculateFinalGrade(dto.scores);
    return this.prisma.grade.create({
      data: { ...dto, finalGrade, scores: dto.scores as any },
    });
  }

  async processExcel(buffer: Buffer, courseId: string) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    // Espera columnas: studentId, studentName, y pares (label_N, score_N, weight_N) o score directo
    const results: any[] = [];
    for (const row of rows) {
      const scores: GradeEntry[] = [];

      // Detectar columnas dinámicas tipo "Prueba1_score", "Prueba1_weight"
      const scoreKeys = Object.keys(row).filter(k => k.endsWith('_score'));
      for (const key of scoreKeys) {
        const label = key.replace('_score', '');
        const weight = parseFloat(row[`${label}_weight`] ?? 1 / scoreKeys.length);
        scores.push({ label, score: parseFloat(row[key]), weight });
      }

      if (scores.length === 0 && row['Nota Final']) {
        scores.push({ label: 'Nota Final', score: parseFloat(row['Nota Final']), weight: 1 });
      }

      const finalGrade = this.calculateFinalGrade(scores);
      const saved = await this.prisma.grade.upsert({
        where: { id: row['id'] ?? 'new_' + row['studentId'] },
        update: { scores: scores as any, finalGrade },
        create: {
          studentId: String(row['studentId']),
          studentName: String(row['studentName']),
          scores: scores as any,
          finalGrade,
          courseId,
        },
      });
      results.push(saved);
    }

    return { imported: results.length, records: results };
  }

  // ── Asistencia ────────────────────────────────────────────────────────────

  async getAttendance(courseId: string) {
    return this.prisma.attendance.findMany({
      where: { courseId },
      orderBy: { date: 'desc' },
    });
  }

  async saveAttendance(records: {
    studentId: string;
    studentName: string;
    date: string;
    present: boolean;
    courseId: string;
  }[]) {
    return this.prisma.attendance.createMany({
      data: records.map(r => ({ ...r, date: new Date(r.date) })),
      skipDuplicates: true,
    });
  }

  async getAttendanceSummary(courseId: string) {
    const records = await this.prisma.attendance.findMany({ where: { courseId } });
    const byStudent: Record<string, { name: string; total: number; present: number }> = {};

    for (const r of records) {
      if (!byStudent[r.studentId]) {
        byStudent[r.studentId] = { name: r.studentName, total: 0, present: 0 };
      }
      byStudent[r.studentId].total++;
      if (r.present) byStudent[r.studentId].present++;
    }

    return Object.entries(byStudent).map(([studentId, s]) => ({
      studentId,
      studentName: s.name,
      totalClasses: s.total,
      attended: s.present,
      percentage: parseFloat(((s.present / s.total) * 100).toFixed(1)),
    }));
  }
}
