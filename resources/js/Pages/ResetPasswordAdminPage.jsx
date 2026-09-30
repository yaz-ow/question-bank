import { useForm, Link } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'

export default function ResetPasswordAdminPage({ token, email = '' }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email,
        password: '',
        password_confirmation: '',
    })

    const { flash } = usePage().props

    const submit = (e) => {
        e.preventDefault()
        post(route('password-reset.admin.store'), {
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        إعادة تعيين كلمة المرور للمسؤول
                    </h2>
                    <p className="text-center text-gray-600">
                        أدخل بريدك الإلكتروني وكلمة المرور الجديدة
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
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                            الرمز السري
                        </label>
                        <input
                            id="token"
                            type="hidden"
                            name="token"
                            value={data.token}
                        />
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            كلمة المرور الجديدة
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
                    <div className="flex w-full justify-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {processing ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    تذكرت كلمة المرور القديمة؟
                    <Link
                        href="/login/admin"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    )
}
