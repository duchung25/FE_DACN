import React, { useState } from 'react';
import { useSchoolClassListViewModel } from './useSchoolClassListViewModel';
import { SchoolClassRequest } from '../../../models/SchoolClass';
import { Card, Table, Pagination, Modal } from '../../../components/UI';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface SchoolClassListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function SchoolClassListView({ triggerToast }: SchoolClassListViewProps) {
  const {
    data, loading, page, size, searchQuery, filterMajorId,
    setPage, setSearchQuery, setFilterMajorId,
    isModalOpen, setIsModalOpen, editingItem, setEditingItem,
    handleSave, handleDelete, majors, academicYears, teachers
  } = useSchoolClassListViewModel();

  const [formData, setFormData] = useState<SchoolClassRequest>({
    code: '',
    name: '',
    majorId: 0,
    entryAcademicYearId: 0,
    homeroomTeacherId: undefined,
    status: 'ACTIVE'
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        majorId: item.majorId || 0,
        entryAcademicYearId: item.entryAcademicYearId || 0,
        homeroomTeacherId: item.homeroomTeacherId,
        status: item.status || 'ACTIVE'
      });
    } else {
      setEditingItem(null);
      setFormData({ code: '', name: '', majorId: 0, entryAcademicYearId: 0, homeroomTeacherId: undefined, status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave(formData);
      triggerToast(editingItem ? 'Cap nhat thanh cong' : 'Them moi thanh cong', 'success');
    } catch {
      triggerToast('Co loi xay ra, vui long thu lai', 'danger');
    }
  };

  const confirmDelete = async (id: number) => {
    if (window.confirm('Ban co chac chan muon xoa lop hanh chinh nay?')) {
      try {
        await handleDelete(id);
        triggerToast('Xoa thanh cong', 'success');
      } catch {
        triggerToast('Khong the xoa, vui long thu lai', 'danger');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quan ly Lop Hanh Chinh</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Them Lop moi
        </button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tim kiem theo ma hoac ten lop..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={filterMajorId?.toString() || ''}
            onChange={(e) => setFilterMajorId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="">Tat ca Nganh</option>
            {majors.map(m => <option key={m.id} value={m.id?.toString()}>{m.name}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table
          columns={[
            { header: 'Ma Lop', accessor: (row: any) => row.code },
            { header: 'Ten Lop', accessor: (row: any) => row.name },
            { header: 'Nganh', accessor: (row: any) => row.majorName },
            { header: 'Nam nhap hoc', accessor: (row: any) => row.entryAcademicYearCode },
            { header: 'GVCN', accessor: (row: any) => row.homeroomTeacherName },
            {
              header: 'Trang thai',
              accessor: (row: any) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  row.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {row.status === 'ACTIVE' ? 'Dang hoat dong' : 'Da dong'}
                </span>
              )
            },
            {
              header: 'Thao tac',
              accessor: (row: any) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chinh sua">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => confirmDelete(row.id!)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xoa">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={data.content}
          emptyMessage="Khong tim thay lop hanh chinh nao"
        />
        <div className="p-4 border-t border-slate-200">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            pageSize={size}
            totalElements={data.totalElements}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Cap nhat Lop hanh chinh' : 'Them Lop hanh chinh moi'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ma lop *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="VD: D15CNPM1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ten lop *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="VD: Ky thuat phan mem 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nganh hoc *</label>
              <select
                value={formData.majorId.toString()}
                onChange={(e) => setFormData({ ...formData, majorId: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="0">-- Chon Nganh hoc --</option>
                {majors.map(m => <option key={m.id} value={m.id?.toString()}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nam nhap hoc *</label>
              <select
                value={formData.entryAcademicYearId.toString()}
                onChange={(e) => setFormData({ ...formData, entryAcademicYearId: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="0">-- Chon Nam hoc --</option>
                {academicYears.map(y => <option key={y.id} value={y.id?.toString()}>{y.code}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Giao vien chu nhiem</label>
            <select
              value={formData.homeroomTeacherId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">-- Khong chi dinh --</option>
              {teachers.map(t => <option key={t.id} value={t.id?.toString()}>{t.teacherCode} - {t.fullName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trang thai</label>
            <select
              value={formData.status || 'ACTIVE'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="ACTIVE">Dang hoat dong</option>
              <option value="INACTIVE">Da dong</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Huy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {editingItem ? 'Cap nhat' : 'Them moi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
