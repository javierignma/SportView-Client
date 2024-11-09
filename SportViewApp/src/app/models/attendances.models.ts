export interface Attendance {
    id: number;
    instructor_id: number; 
    student_id: number;
    student_name: string;
    date: string;
    present: boolean;
}

export interface AttendanceRequest {
    instructor_id: number; 
    student_id: number;
    student_name: string;
    date: string;
    present: boolean;
}