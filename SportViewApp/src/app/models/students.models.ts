export interface Student {
    id: number;
    name: string;
    email: string;
    rut: string;
    sex: string;
    age: number;
    weight: number;
    height: number;
}

export interface NewStudent {
    instructor_id: number;
    name: string;
    email: string;
    rut: string;
    sex?: string;
    age?: number;
    weight?: number;
    height?: number;
}

export interface StudentProgress {
    id: number;
    student_id: number;
    progress_date: string;
    technique: number;
    physique: number;
    combat_iq: number;
}

export interface NewStudentProgress {
    student_id: number;
    progress_date: string;
    technique: number;
    physique: number;
    combat_iq: number;
}