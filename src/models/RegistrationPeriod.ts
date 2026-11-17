export interface RegistrationPhase {
  id?: number;
  phaseName: string;
  phaseOrder?: number;
  startDate: string;
  endDate: string;
  targetAudience?: string;
  allowEnroll?: boolean;
  allowDrop?: boolean;
  description?: string;
  isActive?: boolean;
}

export interface RegistrationPeriod {
  id?: number;
  semesterId: number;
  semesterCode?: string;
  name?: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  phases?: RegistrationPhase[];
  activePhase?: RegistrationPhase;
}

export interface RegistrationPeriodRequest {
  semesterId: number;
  name?: string;
  startDate: string;
  endDate: string;
  isOpen?: boolean;
  phases?: RegistrationPhase[];
}
