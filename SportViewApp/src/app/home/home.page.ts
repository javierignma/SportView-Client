import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { StudentService } from 'src/app/services/student.service';
import { StudentProgressService } from '../services/student-progress.service';
import { forkJoin } from 'rxjs';
import { AttendanceService } from '../services/attendance.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  sportViewLogo: string = '../../../assets/sportview-logo.png';
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
    const today = new Date();
    let currentMonth = today.getMonth(); // Índice del mes actual (0-11)
    let currentYear = today.getFullYear();

    // Calcular el mes anterior
    let previousMonth = currentMonth - 1;
    if (previousMonth < 0) {
      previousMonth = 11; // Si es enero, el mes anterior es diciembre
      currentYear -= 1; // Ajustar el año al año anterior
    }
    this.studentService.getStudents().subscribe((students: any[]) => {
      const requests = students.map(student =>
        this.studentProgressService.getAvgStudentProgress(student.id,previousMonth + 1)
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
  
        console.log('Podio calculado para el mes anterior:', this.topStudents);
      });
    });
  }

  downloadPDF() {
    const pdf = new jsPDF();
  
    // Configuración del logo
    const img = new Image();
    img.src = this.sportViewLogo;
  
    // Imágenes representativas para los KPI
    const kpiIcons = [
      '../../../assets/icon/technique.png', // Técnica
      '../../../assets/icon/fitness.png', // Estado Físico
      '../../../assets/icon/iq.png', // IQ de Combate
      '../../../assets/icon/attendance.png', // Asistencia
    ];
  
    // Imágenes de medallas
    const medalIcons = [
      '../../../assets/icon/gold.png', // Oro
      '../../../assets/icon/silver.png', // Plata
      '../../../assets/icon/bronze.png', // Bronce
    ];
  
    img.onload = () => {
      const pageWidth = pdf.internal.pageSize.width;
  
      // Encabezado con logo y fecha
      const headerY = 10;
      pdf.setFillColor(0, 123, 255); // Azul claro
      pdf.rect(0, headerY, pageWidth, 30, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255); // Blanco
      pdf.text('Reporte de Desempeño', pageWidth / 2, headerY + 12, { align: 'center' });
      pdf.addImage(img, 'PNG', 7, headerY + 5, 20, 25); 
      //FECHA
      pdf.setFontSize(10);
      pdf.text(`${new Date().toLocaleDateString()}`, pageWidth / 2, headerY + 20, { align: 'center' });
      
      // Filtros Aplicados (primero)
      const filtersStartY = headerY + 40;
      pdf.setFillColor(220, 220, 220); // Gris claro
      pdf.setTextColor(0, 0, 0); // Negro
      pdf.rect(10, filtersStartY, pageWidth - 20, 10, 'F');
      pdf.setFontSize(14);
      pdf.text('Filtros Aplicados:', 15, filtersStartY + 7);

      // Filtros Aplicados como tarjetas
        const cardWidth = (pageWidth - 40) / 3; 
        const cardHeight = 20; 
        const cardSpacing = 10;
        const cardStartY = filtersStartY + 15; 
        

        // Tarjeta Año
        pdf.setFillColor(200, 230, 255); // Azul claro
        pdf.roundedRect(10, cardStartY, cardWidth, cardHeight, 3, 3, 'F'); // Tarjeta con bordes redondeados
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.text('Año:', 15, cardStartY + 8);
        pdf.text(`${this.selectedYear || 'Todos'}`, 15, cardStartY + 15);

        // Tarjeta Mes
        pdf.setFillColor(200, 230, 255); // Azul claro
        pdf.roundedRect(10 + cardWidth + cardSpacing, cardStartY, cardWidth, cardHeight, 3, 3, 'F');
        pdf.text('Mes:', 15 + cardWidth + cardSpacing, cardStartY + 8);
        pdf.text(`${this.selectedMonth || 'Todos'}`, 15 + cardWidth + cardSpacing, cardStartY + 15);

        // Tarjeta Estudiante
        pdf.setFillColor(200, 230, 255); // Azul claro
        pdf.roundedRect(10 + 2 * (cardWidth + cardSpacing), cardStartY, cardWidth, cardHeight, 3, 3, 'F');
        pdf.text('Estudiante:', 15 + 2 * (cardWidth + cardSpacing), cardStartY + 8);
        pdf.text(
          `${
            this.selectedStudent === 0
              ? 'Todos'
              : this.students.find((s) => s.id === this.selectedStudent)?.name || 'Desconocido'
          }`,
          15 + 2 * (cardWidth + cardSpacing),
          cardStartY + 15
        );
        const filterRowY = cardStartY + cardHeight ; 

      // Promedios Generales de KPIs (después de los filtros)
      const kpiStartY = filterRowY + 5;
      pdf.setFillColor(220, 220, 220); // Gris claro
      pdf.rect(10, kpiStartY, pageWidth - 20, 10, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0); // Negro
      pdf.text('Promedios Generales de KPIs:', 15, kpiStartY + 7);

      const kpiValues = [
        ['Técnica', `${this.kpiData.technique_avg?.toFixed(2) || 'N/A'}`],
        ['Estado Físico', `${this.kpiData.physique_avg?.toFixed(2) || 'N/A'}`],
        ['IQ de Combate', `${this.kpiData.combat_iq_avg?.toFixed(2) || 'N/A'}`],
        ['Asistencia', `${this.kpiData.attendance_avg?.toFixed(2) || 'N/A'}%`],
      ];

      const columnWidth = (pageWidth - 30) / 2; // Espacio para cada columna
      const rowHeight = 20; // Espacio entre las filas
      let kpiRowY = kpiStartY + 15;

      kpiValues.forEach((kpi, index) => {
        const row = Math.floor(index / 2); // Fila actual (0 o 1)
        const col = index % 2; // Columna actual (0 o 1)
        const x = 25 + col * columnWidth; // Posición X basada en la columna
        const y = kpiRowY + row * rowHeight; // Posición Y basada en la fila
        
        const icon = new Image();
        icon.src = kpiIcons[index]; // Imagen representativa para cada KPI
        pdf.addImage(icon, 'PNG', x + 5, y + 5, 8, 8); // Tamaño ajustado del ícono
        pdf.setFontSize(12);
        pdf.text(kpi[0], x + 20, y + 7); // Título del KPI
        pdf.setFontSize(13);
        pdf.text(kpi[1], x + 20, y + 17); // Valor del KPI

      });
      kpiRowY += 2 * 20 + 10;

      // Podio de Estudiantes (con filas más grandes)
      const podiumStartY = kpiRowY;
      pdf.setFillColor(220, 220, 220); // Gris claro
      pdf.rect(10, podiumStartY - 5, pageWidth - 20, 10, 'F');
      pdf.setFontSize(14);
      pdf.text('Podio de Estudiantes:', 15, podiumStartY + 3);
  
      const podiumValues = this.topStudents.map((student, index) => [
        `${index + 1}`,
        student.name,
        `${student.average.toFixed(2) || 'N/A'}`,
      ]);
  
      const podiumStartTableY = podiumStartY + 10;
      pdf.setFontSize(12);
      pdf.text('Posición', 15, podiumStartTableY);
      pdf.text('Nombre', pageWidth / 2 - 20, podiumStartTableY);
      pdf.text('Promedio', pageWidth - 50, podiumStartTableY);
      
      let lastRowY = podiumStartTableY;
      const rowHeightpodium = 14; // Incremento de espacio entre filas
      podiumValues.forEach((row, index) => {
        const yPosition = podiumStartTableY + rowHeightpodium * (index + 1);
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245); // Gris más claro
          pdf.rect(10, yPosition - 8, pageWidth - 20, rowHeightpodium - 2, 'F');
        }
  
        // Medalla
        const medal = new Image();
        medal.src = medalIcons[index] || medalIcons[2]; 
        pdf.addImage(medal, 'PNG', 10, yPosition - 5, 8, 8);

        pdf.text(row[1], pageWidth / 2 - 20, yPosition);
        pdf.text(row[2], pageWidth - 50, yPosition);
        lastRowY = yPosition;
      });
      
      // Agregar una nota al final del podio
      const noteY = lastRowY + 10; // Espacio adicional debajo del podio
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0); // Color negro para el texto
      pdf.text(
        'Nota: El podio refleja el desempeño promedio de los estudiantes durante el mes anterior.',
        pageWidth / 2,
        noteY,
        { align: 'center' }
      );
  
      // Guardar el PDF
      pdf.save('reporte-desempeno.pdf');
    };
  }
}
  