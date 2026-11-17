import React from 'react';
import { useRegistrationPeriodViewModel } from './useRegistrationPeriodViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Edit2, Loader2, AlertCircle, Calendar, Power, Trash2, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import { RegistrationPeriod } from '../../../models/RegistrationPeriod';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface RegistrationPeriodViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function RegistrationPeriodView({ triggerToast }: RegistrationPeriodViewProps) {
  const {
    periods,
    semesters,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleToggle,
    handleSave,
    handleDelete,
    handlePhaseChange,
    addPhase,
    removePhase
  } = useRegistrationPeriodViewModel();

  const columns = [
    {
      header: 'Đợt & Học Kỳ',
      accessor: (item: RegistrationPeriod) => (
        <div>
          <span className="font-semibold text-slate-800 block">{item.name || `Học kỳ ${item.semesterCode}`}</span>
          <span className="text-xs text-slate-500">Mã HK: {item.semesterCode}</span>
        </div>
      )
    },
    {
      header: 'Thời Gian Đăng Ký',
      accessor: (item: RegistrationPeriod) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{new Date(item.startDate).toLocaleDateString('vi-VN')}</span>
          <span className="text-slate-400">→</span>
          <span>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
        </div>
      )
    },
    {
      header: 'Giai Đoạn Đang Chạy',
      accessor: (item: RegistrationPeriod) => {
        if (!item.isOpen) {
          return <span className="text-xs text-slate-400 italic">Đợt đang đóng</span>;
        }
        if (item.activePhase) {
          return (
            <div className="space-y-1">
              <Badge variant="info">
                {item.activePhase.phaseName}
              </Badge>
              <div className="text-[11px] text-slate-500">
                Đối tượng: <strong className="text-slate-700">{item.activePhase.targetAudience || 'Toàn trường'}</strong>
              </div>
            </div>
          );
        }
        return <span className="text-xs text-amber-600 font-medium">Chưa có giai đoạn hiệu lực</span>;
      }
    },
    {
      header: 'Trạng Thái',
      accessor: (item: RegistrationPeriod) => (
        <Badge variant={item.isOpen ? 'success' : 'danger'}>
          {item.isOpen ? 'Đang mở cổng (OPEN)' : 'Đã đóng cổng (CLOSED)'}
        </Badge>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: RegistrationPeriod) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleToggle(item.id!, item.isOpen, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title={item.isOpen ? 'Đóng cổng & Nghiệm thu lớp' : 'Mở cổng (Chuyển lớp READY -> OPEN)'}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              item.isOpen 
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {item.isOpen ? 'Đóng & Nghiệm thu' : 'Mở đợt'}
          </button>
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            title="Sửa cấu hình đợt & giai đoạn"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title="Xóa cấu hình"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cấu Hình Đợt Đăng Ký Đa Giai Đoạn</h2>
          <p className="text-xs text-slate-500">Quản lý thời gian, nhiều giai đoạn đăng ký, phân quyền đối tượng và nghiệm thu mở lớp</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Cấu hình đợt mới
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-900">
        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800">Quy tắc vòng đời học phần gắn liền với đợt đăng ký:</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-blue-700">
            <li><strong>Mở đợt:</strong> Kiểm tra điều kiện có ít nhất 1 lớp <code className="bg-blue-100 px-1 rounded">READY</code> và tự động chuyển toàn bộ sang <code className="bg-blue-100 px-1 rounded">OPEN</code> để sinh viên đăng ký.</li>
            <li><strong>Đóng đợt:</strong> Nghiệm thu sĩ số — Lớp đủ sĩ số tối thiểu chuyển sang <code className="bg-emerald-100 px-1 rounded text-emerald-800">ACTIVE</code>, lớp không đủ sĩ số chuyển sang <code className="bg-rose-100 px-1 rounded text-rose-800">CANCELED</code>.</li>
            <li><strong>Học liệu & Điểm danh:</strong> Sinh viên chỉ xem được học liệu của các lớp <code className="bg-emerald-100 px-1 rounded text-emerald-800">ACTIVE</code>.</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-700">Lỗi tải dữ liệu</p>
            <p className="mt-1 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      <Card className="relative min-h-[300px]">
        {isLoading && periods.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải cấu hình...</p>
          </div>
        ) : (
          <Table data={periods} columns={columns} emptyMessage="Chưa có cấu hình đợt đăng ký." />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Sửa Đợt Đăng Ký & Giai Đoạn' : 'Tạo Đợt Đăng Ký Đa Giai Đoạn'}
        footer={
          <>
            <button
              onClick={() => handleSave((msg) => triggerToast(msg, 'success'))}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu cấu hình
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Học Kỳ Áp Dụng</label>
              <SearchableSelect
                name="semesterId"
                value={formData.semesterId}
                onChange={(val) => handleInputChange({ target: { name: 'semesterId', value: Number(val) } } as any)}
                disabled={isLoading}
                options={semesters.map(s => ({ value: s.id!, label: s.name }))}
                placeholder="-- Chọn học kỳ --"
                error={!!errors.semesterId}
              />
              {errors.semesterId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.semesterId}</p>}
            </div>

            <FormInput
              label="Tên Đợt Đăng Ký"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: Đợt 1 HK1 2026-2027"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày Bắt Đầu Tổng Thể"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.startDate}
            />
            
            <FormInput
              label="Ngày Kết Thúc Tổng Thể"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.endDate}
            />
          </div>

          {/* Quản lý danh sách các giai đoạn */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Danh Sách Giai Đoạn Đăng Ký (Phases)
                </h4>
                <p className="text-xs text-slate-500">Phân định thời gian, đối tượng và quyền thao tác (Đăng ký / Hủy)</p>
              </div>
              <button
                type="button"
                onClick={addPhase}
                className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm giai đoạn
              </button>
            </div>

            <div className="space-y-3">
              {(formData.phases || []).map((phase, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Giai đoạn {idx + 1}
                    </span>
                    {(formData.phases || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhase(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="Tên Giai Đoạn"
                      value={phase.phaseName}
                      onChange={(e) => handlePhaseChange(idx, 'phaseName', e.target.value)}
                      placeholder="VD: Giai đoạn 1: Đăng ký chính thức"
                    />
                    <FormInput
                      label="Đối Tượng Áp Dụng (Khóa K / Ngành)"
                      value={phase.targetAudience || 'ALL'}
                      onChange={(e) => handlePhaseChange(idx, 'targetAudience', e.target.value)}
                      placeholder="VD: ALL hoặc K62,K63"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="Bắt Đầu Giai Đoạn"
                      type="date"
                      value={phase.startDate}
                      onChange={(e) => handlePhaseChange(idx, 'startDate', e.target.value)}
                    />
                    <FormInput
                      label="Kết Thúc Giai Đoạn"
                      type="date"
                      value={phase.endDate}
                      onChange={(e) => handlePhaseChange(idx, 'endDate', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phase.allowEnroll !== false}
                        onChange={(e) => handlePhaseChange(idx, 'allowEnroll', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="font-medium text-slate-700">Cho phép đăng ký mới</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={phase.allowDrop !== false}
                        onChange={(e) => handlePhaseChange(idx, 'allowDrop', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="font-medium text-slate-700">Cho phép rút / hủy môn</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <input
              type="checkbox"
              id="isOpen"
              name="isOpen"
              checked={formData.isOpen}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="isOpen" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mở cổng ngay sau khi lưu (Sẽ chuyển các lớp READY sang OPEN)
            </label>
          </div>

        </div>
      </Modal>
    </div>
  );
}
