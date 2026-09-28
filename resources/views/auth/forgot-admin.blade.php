<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - مسؤول - بنك الأسئلة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            @apply bg-gray-50;
        }
    </style>
</head>
<body class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-6 p-4">
        <form action="{{ route('password-request-store') }}" method="POST" class="bg-white rounded-lg shadow-md p-6 space-y-6">
            @csrf

            <h2 class="text-center text-2xl font-bold text-gray-800">إعادة تعيين كلمة المرور للمسؤول</h2>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" name="email" id="email"
                       value="{{ old('email') }}"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       required>
                @error('email')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <button type="submit"
                        class="w-full bg-navy-800 hover:bg-navy-900 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    إرسال رابط إعادة التعيين
                </button>
            </div>

            @if(session('status'))
                <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
                    {{ session('status') }}
                </div>
            @endif

            @if($errors->any())
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                    @foreach($errors->all() as $error)
                        <p>{{ $error }}</p>
                    @endforeach
                </div>
            @endif

            <div class="text-center text-sm text-gray-500 mt-4">
                هل تتذكر كلمة المرور؟ <a href="{{ route('login-admin.show') }}" class="font-medium text-indigo-600 hover:text-indigo-500">تسجيل الدخول</a>
            </div>
        </form>
    </div>
</body>
</html>