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