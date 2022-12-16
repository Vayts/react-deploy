export interface Schedule {
  id: number,
  name: string,
  class_id: number,
  teacher_id: number,
  start: Date,
  end: Date,
  required: boolean,
  isGrade: boolean,
}
