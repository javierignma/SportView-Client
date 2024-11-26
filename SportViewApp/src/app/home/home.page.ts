import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { StudentService } from 'src/app/services/student.service';
import { StudentProgressService } from '../services/student-progress.service';
import { jsPDF } from 'jspdf';
import { forkJoin } from 'rxjs';
import { AttendanceService } from '../services/attendance.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  sportViewLogo: string = '../../../assets/sportview-logo.png';
  logo: string = '../../../assets/logo.jpg';
  name: string = ' ';

  years: number[] = [];
  monthNumbers: number[] = [];
  selectedMonth: number = 0; // Por defecto, "Todos"
  students: { id: number; name: string }[] = [];
  kpiData: any = {};
  selectedYear?: number;
  selectedStudent: number = 0; 
  totalPointsAvg: number = 0;
  months: number[] = [];
  
  constructor(
    private dataService: DataService,
    private studentService: StudentService,
    private studentProgressService: StudentProgressService,
    private attendanceService: AttendanceService
    
  ) {}

  ngOnInit() {
    this.loadAttendanceData(); 
    this.loadStudents(); 
    this.loadTopStudents();
  }

  loadAttendanceData() {
    this.dataService.GetD().subscribe(dates => {
      // Extraer años únicos
      this.years = [...new Set(dates.map(date => new Date(date).getFullYear()))];
  
      // Extraer meses únicos como números
      const monthsSet = new Set<number>();
      dates.forEach(date => {
        const parsedDate = new Date(date);
        const month = parsedDate.getMonth() + 1; // Convertir mes base 0 a base 1
        monthsSet.add(month);
      });
  
      // Convertir Set a Array y ordenarlo
      this.monthNumbers = Array.from(monthsSet).sort((a, b) => a - b);
  
      console.log('Años:', this.years);
      console.log('Meses:', this.monthNumbers); // Meses ahora son números como [1, 2, 3, ..., 12]
    });
  }
  
  loadStudents() {
    this.studentService.getStudents().subscribe((students: any[]) => {
      this.students = students.map(student => ({
        id: student.id,
        name: student.name,
      }));

      // Agregar opción "Todos"
      this.students.unshift({ id: 0, name: 'Todos' });
      console.log('Students for Filter:', this.students);
    });
  }
  
  loadStudentKPI() {
    const selectedDate = this.selectedMonth; // El mes seleccionado como número
  
    if (this.selectedStudent === 0) {
      // Obtener promedios generales para todos los estudiantes
      const studentRequests = this.students
        .filter(student => student.id !== 0)
        .map(student => this.studentProgressService.getAvgStudentProgress(student.id, selectedDate));
  
      forkJoin(studentRequests).subscribe(
        (results) => {
          const validResults = results.filter(data =>
            data && (data.physique_avg !== null || data.technique_avg !== null || data.combat_iq_avg !== null)
          );
  
          const totalStudents = validResults.length;
  
          if (totalStudents === 0) {
            this.kpiData = { physique_avg: 0, technique_avg: 0, combat_iq_avg: 0, attendance_avg: 0 };
            this.totalPointsAvg = 0;
          } else {
            const totalKPI = validResults.reduce(
              (acc, data) => {
                acc.physique_avg += data.physique_avg || 0;
                acc.technique_avg += data.technique_avg || 0;
                acc.combat_iq_avg += data.combat_iq_avg || 0;
                return acc;
              },
              { physique_avg: 0, technique_avg: 0, combat_iq_avg: 0 }
            );
  
            this.kpiData = {
              physique_avg: Math.round((totalKPI.physique_avg / totalStudents) * 10) / 10,
              technique_avg: Math.round((totalKPI.technique_avg / totalStudents) * 10) / 10,
              combat_iq_avg: Math.round((totalKPI.combat_iq_avg / totalStudents) * 10) / 10,
              attendance_avg: 0 // Temporalmente
            };
  
            const attendanceRequests = this.students
              .filter(student => student.id !== 0)
              .map(student => this.attendanceService.getAvgAttendances(student.id, selectedDate));
  
            forkJoin(attendanceRequests).subscribe(
              (attendanceResults: any[]) => {
                const totalAttendance = attendanceResults.reduce((sum, attendance) => {
                  return sum + (attendance.avg_attendance || 0); // Usar avg_attendance
                }, 0);
  
                this.kpiData.attendance_avg = Math.round((totalAttendance / totalStudents) * 100);
  
                console.log("[home.page - loadStudentKPI] KPI Data with Attendance:", this.kpiData);
              },
              (error) => {
                console.error("[home.page - loadStudentKPI] Error fetching attendances:", error);
              }
            );
          }
        },
        (error) => {
          console.error("[home.page - loadStudentKPI] Error:", error);
        }
      );
      return;
    }
  
    // Calcular KPI y asistencia para un estudiante específico
    forkJoin([
      this.studentProgressService.getAvgStudentProgress(this.selectedStudent, selectedDate),
      this.attendanceService.getAvgAttendances(this.selectedStudent, selectedDate)
    ]).subscribe(
      ([kpi, attendance]) => {
        const avgAttendance = (attendance as unknown as { avg_attendance: number }).avg_attendance || 0; // Aserción de tipo para acceder a avg_attendance
    
        this.kpiData = {
          physique_avg: kpi.physique_avg || 0,
          technique_avg: kpi.technique_avg || 0,
          combat_iq_avg: kpi.combat_iq_avg || 0,
          attendance_avg: Math.round(avgAttendance * 100) // Convertir a porcentaje
        };
    
        this.totalPointsAvg =
          this.kpiData.physique_avg +
          this.kpiData.technique_avg +
          this.kpiData.combat_iq_avg;
    
        console.log("[home.page - loadStudentKPI] KPI Data for Selected Student:", this.kpiData);
      },
      (error) => {
        console.error("[home.page - loadStudentKPI] Error fetching KPIs or attendance:", error);
        this.kpiData = { physique_avg: 0, technique_avg: 0, combat_iq_avg: 0, attendance_avg: 0 };
      }
    );
    
  }
  
  
  topStudents: { name: string; average: number }[] = [];
  loadTopStudents() {
    this.studentService.getStudents().subscribe((students: any[]) => {
      const requests = students.map(student =>
        this.studentProgressService.getAvgStudentProgress(student.id,0)
      );
  
      forkJoin(requests).subscribe((results: any[]) => {
        const averages = students.map((student, index) => {
          const kpi = results[index];
          const average = ((kpi.physique_avg || 0) + (kpi.technique_avg || 0) + (kpi.combat_iq_avg || 0)) / 3;
  
          return {
            name: student.name,
            average: Math.round(average * 10) / 10, // Redondeo a un decimal
          };
        });
  
        // Ordenar por promedio descendente y seleccionar los mejores 3
        this.topStudents = averages
          .sort((a, b) => b.average - a.average)
          .slice(0, 3);
  
        console.log('Top 3 Students:', this.topStudents);
      });
    });
  }

  downloadPDF() {
    const pdf = new jsPDF();
  
    // Configuración del logo
    const img = new Image();
    img.src = this.logo;
    img.onload = () => {
      // Centrar el logo en la parte superior
      const pageWidth = pdf.internal.pageSize.width;
      pdf.addImage(img, 'JPG', (pageWidth - 30) / 2, 10, 30, 30); 
  
      // Título del reporte
      pdf.setFontSize(18);
      pdf.text('Reporte de Desempeño', pageWidth / 2, 50, { align: 'center' });
  
      // Filtros aplicados
      pdf.setFontSize(14);
      pdf.text('Filtros Aplicados:', 20, 60);
      pdf.setFontSize(12);
      pdf.text(`Año: ${this.selectedYear || 'Todos'}`, 20, 70);
      pdf.text(`Mes: ${this.selectedMonth || 'Todos'}`, 20, 80);
      pdf.text(
        `Estudiante: ${
          this.selectedStudent === 0
            ? 'Todos'
            : this.students.find((s) => s.id === this.selectedStudent)?.name || 'Desconocido'
        }`,
        20,
        90
      );
  
      // Cuadros de KPI
      const boxWidth = 80;
      const boxHeight = 30;
      const marginX = (pageWidth - (boxWidth * 2 + 10)) / 4; // Centrado horizontal
      const startY = 100;
  
      // Técnica y Estado Físico (Primera Fila)
      pdf.rect(marginX, startY, boxWidth, boxHeight);
      pdf.setFontSize(12);
      pdf.text('Técnica', marginX + 5, startY + 10);
      pdf.setFontSize(14);
      pdf.text(`${this.kpiData.technique_avg?.toFixed(2) || 'N/A'}`, marginX + 5, startY + 20);
  
      pdf.rect(marginX + boxWidth + 10, startY, boxWidth, boxHeight);
      pdf.setFontSize(12);
      pdf.text('Estado Físico', marginX + boxWidth + 15, startY + 10);
      pdf.setFontSize(14);
      pdf.text(`${this.kpiData.physique_avg?.toFixed(2) || 'N/A'}`, marginX + boxWidth + 15, startY + 20);
  
      // IQ de Combate y Asistencia (Segunda Fila)
      pdf.rect(marginX, startY + boxHeight + 10, boxWidth, boxHeight);
      pdf.setFontSize(12);
      pdf.text('IQ de Combate', marginX + 5, startY + boxHeight + 20);
      pdf.setFontSize(14);
      pdf.text(`${this.kpiData.combat_iq_avg?.toFixed(2) || 'N/A'}`, marginX + 5, startY + boxHeight + 30);
  
      pdf.rect(marginX + boxWidth + 10, startY + boxHeight + 10, boxWidth, boxHeight);
      pdf.setFontSize(12);
      pdf.text('Asistencia', marginX + boxWidth + 15, startY + boxHeight + 20);
      pdf.setFontSize(14);
      pdf.text(`${this.kpiData.attendance_avg?.toFixed(2) || 'N/A'}%`, marginX + boxWidth + 15, startY + boxHeight + 30);
  
      // Gráfico si está disponible
      const chartCanvas = document.getElementById('areaChart') as HTMLCanvasElement;
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL('image/png');
        pdf.addImage(chartImage, 'PNG', 20, startY + (boxHeight + 20) * 2, 170, 90); // Tamaño ajustado
      }
  
      // Guardar el PDF
      pdf.save('reporte-desempeno.pdf');
    };
  }

  
}  
  