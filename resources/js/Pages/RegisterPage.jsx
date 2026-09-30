import { useForm, Link } from '@inertiajs/react'
import { useState } from 'react'

export default function RegisterPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        university_id: '',
        password: '',
        password_confirmation: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post(route('register'), {
            onSuccess: () => reset(),
            onError: (page) => {
                // Set form errors from the response
                setData(page.props.errors || data)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        إنشاء حساب جديد
                    </h2>
                    <p className="text-center text-gray-600">
                        انضم إلى نظام سؤال وجواب لتبدأ رحلتك التعليمية
                    </p>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            الاسم الكامل
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.name && <span className="mt-1 text-sm text-red-600">{errors.name}</span>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            البريد الإلكتروني
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.email && <span className="mt-1 text-sm text-red-600">{errors.email}</span>}
                    </div>
                    <div>
                        <label htmlFor="university_id" className="block text-sm font-medium text-gray-700">
                            الرقم الجامعي
                        </label>
                        <input
                            id="university_id"
                            type="text"
                            name="university_id"
                            value={data.university_id}
                            onChange={(e) => setData('university_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="M seguido de 9 dígitos"
                            required
                        />
                        {errors.university_id && <span className="mt-1 text-sm text-red-600">{errors.university_id}</span>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.password && <span className="mt-1 text-sm text-red-600">{errors.password}</span>}
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                            تأكيد كلمة المرور
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.password_confirmation && <span className="mt-1 text-sm text-red-600">{errors.password_confirmation}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="terms"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                أتفق على الشروط والأحكام
                            </label>
                        </div>
                    </div>
                    <div className="flex w-full justify-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {processing ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-500">
                    هل لديك حساب already?
                    <Link
                        href="/login/student"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    )
}
