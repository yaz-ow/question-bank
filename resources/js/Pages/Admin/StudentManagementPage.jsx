import { useForm, Link } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { useState } from 'react'

export default function AdminStudentManagementPage({ students, filters }) {
    const { data, setData, get, processing, relocate } = useForm({
        search: filters.search || '',
    })

    const { flash } = usePage().props

    const [confirmingToggle, setConfirmingToggle] = useState(null)

    const handleToggle = (studentId) => {
        setConfirmingToggle(studentId)
    }

    const confirmToggle = (studentId) => {
        // Create a temporary form for the toggle request
        const toggleForm = useForm({
            _method: 'POST',
        })

        toggleForm.post(route('admin.students.toggle', studentId), {
            onSuccess: () => {
                setConfirmingToggle(null)
                relocate(route('admin.students.index', { search: data.search }))
            },
            onError: () => {
                setConfirmingToggle(null)
            }
        })
    }

    const cancelToggle = () => {
        setConfirmingToggle(null)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl space-y-6">
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        إدارة الطلاب
                    </h2>
                    <p className="text-center text-gray-600">
                        إدارة حسابات الطلاب، البحث، وتفعيل أو تعطيل الحسابات
                    </p>
                </div>
                {flash.error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                        {flash.error}
                    </div>
                )}
                {flash.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
                        {flash.success}
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                            البحث بالاسم أو الرقم الجامعي أو البريد الإلكتروني
                        </label>
                        <div className="mt-1 flex">
                            <input
                                id="search"
                                type="text"
                                name="search"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="ابحث عن طالب..."
                            />
                            <button
                                onClick={() => get(route('admin.students.index', { search: data.search }))}
                                className="ml-3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                بحث
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-50 opacity-75">
                            {confirmingToggle !== null && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="bg-white rounded-lg p-6 text-center w-full max-w-xs">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            تأكيد الإجراء
                                        </h3>
                                        <p className="mb-4 text-gray-600">
                                            هل أنت متأكد من أنك تريد تغيير حالة هذا الطالب؟
                                        </p>
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                onClick={() => confirmToggle(confirmingToggle)}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                            >
                                                نعم
                                            </button>
                                            <button
                                                onClick={cancelToggle}
                                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                لا
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <table className="w-full text-sm text-left rtl:ignore text-right">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-900">
                                        الاسم
                                    </th>
                                    <th className="px-4 py-3 font-medium text-gray-900">
                                        الرقم الجامعي
                                    </th>
                                    <th className="px-4 py-3 font-medium text-gray-900">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-4 py-3 font-medium text-gray-900">
                                        الحالة
                                    </th>
                                    <th className="px-4 py-3 font-medium text-gray-900">
                                        الإجراء
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{student.university_id}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{student.email}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            {student.is_active ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    مفعل
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    معطل
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 space-x-2">
                                            <button
                                                onClick={() => handleToggle(student.id)}
                                                className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                تبديل
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {students.last_page > 1 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                عرض {students.from} إلى {students.to} من {students.total} طالب
                            </span>
                            <div className="flex space-x-2 rtl:reverse">
                                {students.current_page > 1 && (
                                    <Link
                                        href={route('admin.students.index', { page: students.current_page - 1, search: data.search })}
                                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        السابق
                                    </Link>
                                )}
                                {students.current_page < students.last_page && (
                                    <Link
                                        href={route('admin.students.index', { page: students.current_page + 1, search: data.search })}
                                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        التالي
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link
                        href="/admin/dashboard"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        العودة إلى لوحة التحكم
                    </Link>
                </div>
            </div>
        </div>
    )
}