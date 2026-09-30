import { useForm, Link } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'

export default function ForgotPasswordAdminPage() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    })

    const { flash } = usePage().props

    const submit = (e) => {
        e.preventDefault()
        post(route('password-request-admin'), {
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        طلب إعادة تعيين كلمة المرور للمسؤول
                    </h2>
                    <p className="text-center text-gray-600">
                        أدخل بريدك الإلكتروني لاستلام رابط إعادة تعيين كلمة المرور
                    </p>
                </div>
                {flash.status && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
                        {flash.status}
                    </div>
                )}
                <form onSubmit={submit} className="space-y-6">
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
                    <div className="flex w-full justify-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            {processing ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    تذكرت كلمة المرور؟
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
