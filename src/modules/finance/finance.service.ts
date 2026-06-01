import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const records = await this.prisma.financeRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = records.reduce((s, r) => s + r.revenue, 0);
    const totalExpenses = records.reduce((s, r) => s + r.expenses, 0);
    const avgMargin = records.length
      ? records.reduce((s, r) => s + r.netMargin, 0) / records.length
      : 0;

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        avgNetMargin: parseFloat(avgMargin.toFixed(2)),
      },
      records,
    };
  }

  async createRecord(dto: {
    period: string;
    revenue: number;
    expenses: number;
    description?: string;
    generatedBy: string;
  }) {
    const netMargin = dto.revenue > 0
      ? parseFloat((((dto.revenue - dto.expenses) / dto.revenue) * 100).toFixed(2))
      : 0;

    return this.prisma.financeRecord.create({
      data: { ...dto, netMargin },
    });
  }

  async getByPeriod(period: string) {
    return this.prisma.financeRecord.findMany({
      where: { period: { contains: period } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
