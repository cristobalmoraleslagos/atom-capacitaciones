import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Request, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessorService } from './professor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/professor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PROFESSOR')
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  // ── Cursos ──────────────────────────────────────────────────────────────

  @Get('courses')
  getCourses(@Request() req: any) {
    return this.professorService.getCourses(req.user.id);
  }

  @Post('courses')
  createCourse(@Body() body: any, @Request() req: any) {
    return this.professorService.createCourse({ ...body, professorId: req.user.id });
  }

  // ── Calculadora de notas (no requiere BD) ───────────────────────────────

  @Post('grades/calculate')
  calculateGrade(@Body() body: { scores: { label: string; score: number; weight: number }[] }) {
    const finalGrade = this.professorService.calculateFinalGrade(body.scores);
    return { finalGrade, scores: body.scores };
  }

  // ── Notas por curso ──────────────────────────────────────────────────────

  @Get('courses/:courseId/grades')
  getGrades(@Param('courseId') courseId: string) {
    return this.professorService.getGrades(courseId);
  }

  @Post('courses/:courseId/grades')
  saveGrade(@Param('courseId') courseId: string, @Body() body: any) {
    return this.professorService.saveGrade({ ...body, courseId });
  }

  @Post('courses/:courseId/grades/import')
  @UseInterceptors(FileInterceptor('file'))
  importGrades(@Param('courseId') courseId: string, @UploadedFile() file: Express.Multer.File) {
    return this.professorService.processExcel(file.buffer, courseId);
  }

  // ── Asistencia ───────────────────────────────────────────────────────────

  @Get('courses/:courseId/attendance')
  getAttendance(@Param('courseId') courseId: string) {
    return this.professorService.getAttendance(courseId);
  }

  @Get('courses/:courseId/attendance/summary')
  getAttendanceSummary(@Param('courseId') courseId: string) {
    return this.professorService.getAttendanceSummary(courseId);
  }

  @Post('courses/:courseId/attendance')
  saveAttendance(@Param('courseId') courseId: string, @Body() body: any[]) {
    return this.professorService.saveAttendance(body.map(r => ({ ...r, courseId })));
  }
}
