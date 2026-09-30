import FlashMessages from '../Components/FlashMessages';
import { useForm, Link } from '@inertiajs/react'

export default function LoginStudentPage() {
    const { data, setData, post, processing, errors } = useForm({
        university_id: '',
        password: '',
    })


    const submit = (e) => {
        e.preventDefault()
        post(route('login-student.store'), {
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <FlashMessages />
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        تسجيل دخول الطالب
                    </h2>
                    <p className="text-center text-gray-600">
                        أدخل رقمك الجامعي وكلمة المرور للدخول إلى حسابك
                    </p>
                </div>
                <form onSubmit={submit} className="space-y-6">
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
                            placeholder="M ثم 9 أرقام، مثال: M123456789"
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
                    <div className="flex items-center justify-between">
                        <Link
                            href="/password/request/student"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            نسيت كلمة المرور؟
                        </Link>
                    </div>
                    <div className="flex w-full justify-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {processing ? 'جاري الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </div>
                </form>
                <div className="text-center"><Link href={route('register')} className="text-indigo-600">إنشاء حساب طالب جديد</Link></div>
                <div className="mt-6 text-center text-sm text-gray-500">
                    هل أنت مسؤول؟
                    <Link
                        href="/login/admin"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        تسجيل دخول المسؤول
                    </Link>
                </div>
            </div>
        </div>
    )
}
