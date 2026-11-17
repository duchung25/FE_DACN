import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { SchoolClass, SchoolClassRequest } from '../../../models/SchoolClass';
import { Major } from '../../../models/Major';
import { AcademicYear } from '../../../models/AcademicYear';
import { Teacher } from '../../../models/Teacher';
import { PageResponse } from '../../../models/PageResponse';

export function useSchoolClassListViewModel() {
  const [data, setData] = useState<PageResponse<SchoolClass>>({ content: [], totalElements: 0, totalPages: 0, pageSize: 10, pageNumber: 0, last: true });
  const [majors, setMajors] = useState<Major[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajorId, setFilterMajorId] = useState<number | undefined>(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolClass | null>(null);

  const fetchDependencies = async () => {
    try {
      const [majorList, yearList, teacherList] = await Promise.all([
        adminApi.getAllMajorsList(),
        adminApi.getAllAcademicYears(),
        adminApi.getAllTeachersList()
      ]);
      setMajors(majorList);
      setAcademicYears(yearList);
      setTeachers(teacherList);
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getAllSchoolClassesPaged(page, size, searchQuery, filterMajorId);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách lớp hành chính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, size, searchQuery, filterMajorId]);

  const handleSave = async (formData: SchoolClassRequest) => {
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateSchoolClass(editingItem.id, formData);
      } else {
        await adminApi.createSchoolClass(formData);
      }
      setIsModalOpen(false);
      fetchData();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu lớp hành chính');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteSchoolClass(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xoá lớp hành chính');
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    page,
    size,
    searchQuery,
    filterMajorId,
    setPage,
    setSize,
    setSearchQuery,
    setFilterMajorId,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    handleSave,
    handleDelete,
    majors,
    academicYears,
    teachers
  };
}
