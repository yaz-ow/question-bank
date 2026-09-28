<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - طالب - بنك الأسئلة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            @apply bg-gray-50;
        }
    </style>
</head>
<body class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-6 p-4">
        <form action="{{ route('password-update') }}" method="POST" class="bg-white rounded-lg shadow-md p-6 space-y-6">
            @csrf
            <input type="hidden" name="token" value="{{ $token }}">

            <h2 class="text-center text-2xl font-bold text-gray-800">إعادة تعيين كلمة المرور</h2>

            <div>
                <label for="university_id" class="block text-sm font-medium text-gray-700 mb-1">الرقم الجامعي</label>
                <input type="text" name="university_id" id="university_id"
                       value="{{ old('university_id') }}"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       placeholder="م seguido de 9 dígitos ej: M451003333"
                       required>
                @error('university_id')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" name="email" id="email"
                       value="{{ old('email') }}"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       required>
                @error('email')
                    <p class="mt-1 text-sm text-red-600>{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input type="password" name="password" id="password"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       required>
                @error('password')
                    <p class="mt-1 text-sm text-red-600>{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <input type="password" name="password_confirmation" id="password_confirmation"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       required>
                @error('password_confirmation')
                    <p class="mt-1 text-sm text-red-600>{{ $message }}</p>
                @enderror
            </div>

            <div>
                <button type="submit"
                        class="w-full bg-navy-800 hover:bg-navy-900 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    إعادة تعيين كلمة المرور
                </button>
            </div>

            @if(session('status'))
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
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
                هل تتذكر كلمة المرور؟ <a href="{{ route('login-student.show') }}" class="font-medium text-indigo-600 hover:text-indigo-500">تسجيل الدخول</a>
            </div>
        </form>
    </div>
</body>
</html>