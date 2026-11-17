import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { RegistrationPeriod, RegistrationPeriodRequest } from '../../../models/RegistrationPeriod';
import { Semester } from '../../../models/Semester';

export function useRegistrationPeriodViewModel() {
  const [periods, setPeriods] = useState<RegistrationPeriod[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistrationPeriod | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<RegistrationPeriodRequest>({
    semesterId: 0,
    name: '',
    startDate: '',
    endDate: '',
    isOpen: false,
    phases: []
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [periodData, semesterData] = await Promise.all([
        adminApi.getAllRegistrationPeriods(),
        adminApi.getAllSemesters()
      ]);
      setPeriods(periodData || []);
      setSemesters(semesterData || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu thời gian đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    const startStr = new Date().toISOString().split('T')[0];
    const endStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const midStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setEditingItem(null);
    setFormData({
      semesterId: semesters.length > 0 ? semesters[0].id! : 0,
      name: semesters.length > 0 ? `Đợt đăng ký ${semesters[0].name}` : '',
      startDate: startStr,
      endDate: endStr,
      isOpen: false,
      phases: [
        {
          phaseName: 'Giai đoạn 1: Đăng ký chính thức',
          phaseOrder: 1,
          startDate: startStr,
          endDate: midStr,
          targetAudience: 'ALL',
          allowEnroll: true,
          allowDrop: true,
          description: 'Dành cho tất cả sinh viên đăng ký môn học theo kế hoạch'
        },
        {
          phaseName: 'Giai đoạn 2: Đăng ký bổ sung & Hủy môn',
          phaseOrder: 2,
          startDate: midStr,
          endDate: endStr,
          targetAudience: 'ALL',
          allowEnroll: true,
          allowDrop: true,
          description: 'Đăng ký các lớp còn chỗ hoặc điều chỉnh môn học'
        }
      ]
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: RegistrationPeriod) => {
    setEditingItem(item);
    setFormData({
      semesterId: item.semesterId,
      name: item.name || '',
      startDate: item.startDate,
      endDate: item.endDate,
      isOpen: item.isOpen,
      phases: item.phases && item.phases.length > 0 ? [...item.phases] : [
        {
          phaseName: 'Giai đoạn 1: Đăng ký chính thức',
          phaseOrder: 1,
          startDate: item.startDate,
          endDate: item.endDate,
          targetAudience: 'ALL',
          allowEnroll: true,
          allowDrop: true
        }
      ]
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'semesterId') {
      finalValue = Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePhaseChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedPhases = [...(prev.phases || [])];
      updatedPhases[index] = {
        ...updatedPhases[index],
        [field]: value
      };
      return { ...prev, phases: updatedPhases };
    });
  };

  const addPhase = () => {
    setFormData(prev => {
      const currentPhases = prev.phases || [];
      const newOrder = currentPhases.length + 1;
      return {
        ...prev,
        phases: [
          ...currentPhases,
          {
            phaseName: `Giai đoạn ${newOrder}: Đăng ký bổ sung`,
            phaseOrder: newOrder,
            startDate: prev.startDate,
            endDate: prev.endDate,
            targetAudience: 'ALL',
            allowEnroll: true,
            allowDrop: true
          }
        ]
      };
    });
  };

  const removePhase = (index: number) => {
    setFormData(prev => {
      const updatedPhases = (prev.phases || []).filter((_, i) => i !== index);
      return { ...prev, phases: updatedPhases };
    });
  };

  const handleToggle = async (id: number, currentStatus: boolean, onSuccess: (msg: string) => void) => {
    const actionName = !currentStatus ? 'MỞ' : 'ĐÓNG';
    const confirmMessage = !currentStatus
      ? 'XÁC NHẬN MỞ ĐỢT ĐĂNG KÝ:\n\nHệ thống sẽ kiểm tra điều kiện (cần có lớp READY) và tự động chuyển TẤT CẢ các lớp học phần READY của học kỳ này sang OPEN để sinh viên đăng ký.\n\nBạn có chắc chắn muốn MỞ cổng?'
      : 'XÁC NHẬN ĐÓNG ĐỢT ĐĂNG KÝ & NGHIỆM THU LỚP:\n\nHệ thống sẽ tự động kiểm tra sĩ số của toàn bộ lớp OPEN:\n- Các lớp đủ sĩ số tối thiểu (>= minCapacity) sẽ được mở chính thức (ACTIVE).\n- Các lớp không đủ sĩ số sẽ bị HỦY (CANCELED) và hủy đăng ký của sinh viên.\n\nBạn có chắc chắn muốn ĐÓNG cổng?';

    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    try {
      await adminApi.toggleRegistrationPeriod(id, !currentStatus);
      await fetchData();
      onSuccess(`Đã ${actionName} cổng đăng ký và cập nhật trạng thái lớp học phần thành công!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái đợt đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const tempErrs: Record<string, string> = {};
    if (!formData.semesterId) tempErrs.semesterId = 'Vui lòng chọn học kỳ';
    if (!formData.startDate) tempErrs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) tempErrs.endDate = 'Vui lòng chọn ngày kết thúc';
    else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      tempErrs.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }
    setErrors(tempErrs);
    return Object.keys(tempErrs).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const updatedPeriod = await adminApi.createOrUpdateRegistrationPeriod(formData);
      setPeriods(prev => {
        const exists = prev.find(p => p.id === updatedPeriod.id);
        if (exists) {
          return prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p);
        }
        return [updatedPeriod, ...prev];
      });
      onSuccess(`Đã cấu hình thời gian đăng ký thành công!`);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, onSuccess: (msg: string) => void) => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      setIsLoading(true);
      try {
        await adminApi.deleteRegistrationPeriod(id);
        setPeriods(prev => prev.filter(p => p.id !== id));
        onSuccess('Đã xóa cấu hình thành công!');
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa cấu hình');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
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
  };
}
