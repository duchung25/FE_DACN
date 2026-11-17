import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { ClassSection } from '../../../../models';

export interface FormattedAttendanceRecord {
  id: number;
  sessionId: number;
  sessionTitle: string;
  sessionDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string;
  note?: string;
  checkedAt?: string;
}

export function useAttendanceViewModel(
  selectedClass: ClassSection,
  triggerToast?: (msg: string, type: 'success' | 'danger') => void
) {
  const [records, setRecords] = useState<FormattedAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass?.id) return;
      setLoading(true);
      try {
        const recordsRes = await studentApi.getMyAttendance(Number(selectedClass.id));
        const rawRecords = (recordsRes as any) || [];

        const mapped: FormattedAttendanceRecord[] = rawRecords.map((r: any) => ({
          id: r.id,
          sessionId: r.attendanceSessionId,
          sessionTitle: r.sessionTitle || 'Buổi học',
          sessionDate: r.sessionDate || '',
          status: (r.status || 'ABSENT').toUpperCase(),
          note: r.note,
          checkedAt: r.checkedAt
        }));

        // Sắp xếp theo ngày học tăng dần
        mapped.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

        setRecords(mapped);
      } catch (err: any) {
        console.error('Lỗi khi tải lịch sử điểm danh:', err);
        if (triggerToast) {
          triggerToast('Không thể tải dữ liệu điểm danh của môn học.', 'danger');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedClass?.id]);

  // Thống kê chuyên cần
  const totalSessions = records.length;
  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const excusedCount = records.filter(r => r.status === 'EXCUSED').length;

  // Tỷ lệ chuyên cần (%) = (Có mặt + Muộn) / Tổng số buổi * 100
  const attendanceRate = totalSessions > 0
    ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
    : 100;

  // Cảnh báo nguy cơ bị cấm thi theo quy chế đào tạo (nghỉ > 20% tổng số buổi)
  const isAtRisk = totalSessions > 0 && (absentCount / totalSessions > 0.2 || attendanceRate < 80);

  return {
    records,
    loading,
    totalSessions,
    presentCount,
    lateCount,
    absentCount,
    excusedCount,
    attendanceRate,
    isAtRisk
  };
}
