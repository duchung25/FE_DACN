import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { ClassSection, ClassSectionRequest } from '../../../models/ClassSection';
import { Subject } from '../../../models/Subject';
import { Teacher } from '../../../models/Teacher';
import { Department } from '../../../models/Department';
import { Major } from '../../../models/Major';
import { Semester } from '../../../models/Semester';
import { useSearchParams } from 'react-router-dom';

export function useClassSectionListViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semesterIdFromUrl = searchParams.get('semesterId') ? Number(searchParams.get('semesterId')) : undefined;

  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassSection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClassSectionRequest>({
    departmentId: undefined,
    majorId: undefined,
    subjectId: 0,
    teacherId: 0,
    semesterId: 0,
    sectionCode: '',
    room: '',
    weekday: 2,
    startTime: '07:00',
    endTime: '09:00',
    startDate: '',
    endDate: '',
    capacity: 40,
    minCapacity: 15,
    status: 'READY'
  });

  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(semesterIdFromUrl);
  

  useEffect(() => {
    setSelectedSemesterId(semesterIdFromUrl);
  }, [semesterIdFromUrl]);

  const clearSemesterFilter = () => {
    const yearId = searchParams.get('yearId');
    const params: Record<string, string> = {};
    if (yearId) params.yearId = yearId;
    setSearchParams(params);
    setSelectedSemesterId(undefined);
  };

  const fetchOptions = async () => {
    try {
      const [subjectData, teacherData, deptData, majorData, semesterData] = await Promise.all([
        adminApi.getAllSubjectsList(),
        adminApi.getAllTeachersList(),
        adminApi.getAllDepartments(),
        adminApi.getAllMajorsList(),
        adminApi.getAllSemesters()
      ]);
      setSubjects(subjectData || []);
      setFilteredSubjects(subjectData || []);
      setTeachers(teacherData || []);
      setDepartments(deptData || []);
      setMajors(majorData || []);
      setSemesters(semesterData || []);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu options:', err);
    }
  };

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<number | undefined>(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  const filteredMajorsForFilter = React.useMemo(() => {
    // Force cache invalidation
    if (!selectedDepartmentId) return majors;
    return majors.filter(m => m.departmentId === selectedDepartmentId);
  }, [majors, selectedDepartmentId]);

  const fetchClassSections = async (
    signal?: AbortSignal,
    currentPage = page,
    currentSize = pageSize,
    currentSearch = debouncedSearch,
    currentSemesterId = selectedSemesterId,
    currentSubjectId = selectedSubjectId,
    currentDeptId = selectedDepartmentId,
    currentMajorId = selectedMajorId
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllClassSections(
        currentPage, currentSize, currentSearch, currentSemesterId, 
        currentSubjectId, currentDeptId, currentMajorId
      );
      if (signal?.aborted) return;
      setClassSections(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      if (signal?.aborted) return;
      setError(err.message || 'Lỗi khi tải dữ liệu lớp học phần');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClassSections(
      controller.signal, page, pageSize, debouncedSearch, 
      selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId
    );
    return () => controller.abort();
  }, [page, pageSize, debouncedSearch, selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      departmentId: undefined,
      majorId: undefined,
      subjectId: 0,
      teacherId: teachers.length > 0 ? teachers[0].id! : 0,
      semesterId: semesterIdFromUrl || (semesters.length > 0 ? semesters[0].id! : 0),
      sectionCode: '',
      room: '',
      weekday: 2,
      startTime: '07:00',
      endTime: '09:00',
      startDate: '',
      endDate: '',
      capacity: 40,
      minCapacity: 15,
      status: 'READY'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: ClassSection) => {
    setEditingItem(item);
    setFormData({ 
      departmentId: item.departmentId,
      majorId: item.majorId,
      subjectId: item.subjectId,
      teacherId: item.teacherId,
      semesterId: item.semesterId,
      sectionCode: item.sectionCode,
      room: item.room || '',
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      startDate: item.startDate,
      endDate: item.endDate,
      capacity: item.capacity,
      minCapacity: item.minCapacity || 15,
      status: item.status || 'READY'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['departmentId', 'majorId', 'subjectId', 'teacherId', 'semesterId', 'weekday', 'capacity', 'minCapacity'].includes(name);
    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumberField ? Number(value) : value 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.sectionCode.trim()) tempErrors.sectionCode = 'Mã lớp không được để trống';
    if (!formData.subjectId) tempErrors.subjectId = 'Vui lòng chọn môn học';
    if (!formData.teacherId) tempErrors.teacherId = 'Vui lòng chọn giảng viên';
    if (!formData.semesterId) tempErrors.semesterId = 'Vui lòng chọn học kỳ';
    if (!formData.startDate) tempErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) tempErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    if (!formData.startTime) tempErrors.startTime = 'Vui lòng nhập giờ bắt đầu';
    if (!formData.endTime) tempErrors.endTime = 'Vui lòng nhập giờ kết thúc';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        tempErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }

    if (formData.startTime && formData.endTime && formData.startTime > formData.endTime) {
        tempErrors.endTime = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    }

    if (!formData.capacity || formData.capacity <= 0) {
        tempErrors.capacity = 'Sức chứa tối đa phải lớn hơn 0';
    }

    if (!formData.minCapacity || formData.minCapacity <= 0) {
        tempErrors.minCapacity = 'Sĩ số tối thiểu phải lớn hơn 0';
    }

    if (formData.capacity && formData.minCapacity && formData.minCapacity > formData.capacity) {
        tempErrors.minCapacity = 'Sĩ số tối thiểu không được lớn hơn sức chứa tối đa';
    }

    if (editingItem && editingItem.enrolledCount && formData.capacity && formData.capacity < editingItem.enrolledCount) {
        tempErrors.capacity = `Sức chứa mới không được nhỏ hơn số SV đã đăng ký (${editingItem.enrolledCount} SV)`;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateClassSection(editingItem.id, formData);
        onSuccess(`Đã cập nhật lớp học phần ${formData.sectionCode} thành công!`);
      } else {
        await adminApi.createClassSection(formData);
        onSuccess(`Đã thêm mới lớp học phần ${formData.sectionCode} thành công!`);
      }
      setIsModalOpen(false);
      fetchClassSections();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, code: string, onSuccess: (msg: string) => void) => {
    const target = classSections.find(c => c.id === id);
    if (target && target.status && target.status !== 'READY') {
      alert(`Không thể xóa lớp ${code} vì lớp đang ở trạng thái ${target.status}. Chỉ được phép xóa lớp ở trạng thái READY.`);
      return;
    }
    if (target && target.enrolledCount && target.enrolledCount > 0) {
      alert(`Không thể xóa lớp ${code} vì đã có ${target.enrolledCount} sinh viên đăng ký học phần.`);
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa lớp học phần ${code}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteClassSection(id);
        onSuccess(`Đã xóa lớp học phần ${code} thành công!`);
        fetchClassSections();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa lớp học phần');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectChange = (name: string, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    classSections,
    subjects,
    teachers,
    departments,
    majors,
    semesters,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSemesterId,
    setSelectedSemesterId,
    semesterIdFromUrl,
    clearSemesterFilter,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedMajorId,
    setSelectedMajorId,
    selectedSubjectId,
    setSelectedSubjectId,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSelectChange,
    handleSave,
    handleDelete,
    filteredSubjects,
    filteredMajorsForFilter
  };
}
