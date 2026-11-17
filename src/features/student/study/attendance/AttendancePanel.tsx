import React from 'react';
import { Card, Badge } from '../../../../components/UI';
import { CheckCircle2, XCircle, Clock, AlertTriangle, AlertCircle, Calendar, UserCheck } from 'lucide-react';
import { ClassSection } from '../../../../models';
import { useAttendanceViewModel } from './useAttendanceViewModel';

export interface AttendancePanelProps {
  selectedClass: ClassSection;
  triggerToast?: (msg: string, type: 'success' | 'danger') => void;
}

export function AttendancePanel({ selectedClass, triggerToast }: AttendancePanelProps) {
  const {
    records,
    loading,
    totalSessions,
    presentCount,
    lateCount,
    absentCount,
    excusedCount,
    attendanceRate,
    isAtRisk
  } = useAttendanceViewModel(selectedClass, triggerToast);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Badge variant="success" className="gap-1 px-2.5 py-1 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Có mặt
          </Badge>
        );
      case 'LATE':
        return (
          <Badge variant="warning" className="gap-1 px-2.5 py-1 text-xs">
            <AlertCircle className="h-3.5 w-3.5" /> Đi muộn
          </Badge>
        );
      case 'EXCUSED':
        return (
          <Badge variant="info" className="gap-1 px-2.5 py-1 text-xs">
            <UserCheck className="h-3.5 w-3.5" /> Có phép
          </Badge>
        );
      case 'ABSENT':
      default:
        return (
          <Badge variant="danger" className="gap-1 px-2.5 py-1 text-xs">
            <XCircle className="h-3.5 w-3.5" /> Vắng mặt
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Warning Alert if Student is at risk of exam ban */}
      {isAtRisk && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-800">Cảnh báo chuyên cần: Nguy cơ cấm thi!</h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Bạn đã vắng <strong>{absentCount}</strong> trên tổng số <strong>{totalSessions}</strong> buổi học (Tỷ lệ chuyên cần: {attendanceRate}%).
              Theo quy chế đào tạo tín chỉ, sinh viên vắng quá 20% tổng số tiết học sẽ không đủ điều kiện tham dự kỳ thi kết thúc học phần.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-3xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tổng số buổi</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{totalSessions}</span>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-100 shadow-3xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Có mặt</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{presentCount}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 bg-amber-50/50 border-amber-100 shadow-3xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Đi muộn</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{lateCount}</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4 bg-rose-50/50 border-rose-100 shadow-3xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">Vắng mặt</span>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-rose-700">{absentCount}</span>
              {excusedCount > 0 && (
                <span className="text-[11px] text-rose-500 ml-1 font-medium">({excusedCount} có phép)</span>
              )}
            </div>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
        </Card>
      </div>

      {/* Attendance Rate Progress Card */}
      <Card className="p-4 bg-white border-slate-200 shadow-3xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Tỷ lệ chuyên cần học phần</span>
          <span className={`font-bold ${attendanceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {attendanceRate}% {attendanceRate >= 80 ? '(Đủ điều kiện thi)' : '(Nguy cơ cấm thi)'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
          />
        </div>
      </Card>

      {/* History Table */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-3xs">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Sổ ghi điểm danh chi tiết</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Điểm danh do Giảng viên phụ trách ghi nhận</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Đang tải dữ liệu điểm danh...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Chưa có buổi học nào được ghi nhận điểm danh cho lớp học phần này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14 text-center">STT</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày học</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên buổi học</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record, index) => (
                  <tr key={record.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400 text-center">{index + 1}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">
                      {record.sessionDate ? new Date(record.sessionDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {record.sessionTitle}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex justify-center">
                        {renderStatusBadge(record.status)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 italic">
                      {record.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
