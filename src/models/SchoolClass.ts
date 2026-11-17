export interface SchoolClass {
  id?: number;
  code: string;
  name: string;
  majorId?: number;
  majorName?: string;
  entryAcademicYearId?: number;
  entryAcademicYearCode?: string;
  homeroomTeacherId?: number;
  homeroomTeacherName?: string;
  status?: string;
}

export interface SchoolClassRequest {
  code: string;
  name: string;
  majorId: number;
  entryAcademicYearId: number;
  homeroomTeacherId?: number;
  status?: string;
}
