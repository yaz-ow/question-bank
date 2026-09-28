<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل دخول الطالب - بنك الأسئلة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            @apply bg-gray-50;
        }
    </style>
</head>
<body class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-6 p-4">
        <form action="{{ route('login-student.store') }}" method="POST" class="bg-white rounded-lg shadow-md p-6 space-y-6">
            @csrf

            <h2 class="text-center text-2xl font-bold text-gray-800">تسجيل دخول الطالب</h2>

            <div>
                <label for="university_id" class="block text-sm font-medium text-gray-700 mb-1">الرقم الجامعي</label>
                <input type="text" name="university_id" id="university_id"
                       value="{{ old('university_id') }}"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       placeholder="م seguito de 9 dígitos ej: M451003333"
                       required>
                @error('university_id')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input type="password" name="password" id="password"
                       class="mt-block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       required>
                @error('password')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-start">
                    <div class="flex items-center h-5">
                        <input id="remember" type="checkbox" class="w-4 h-4 text-indigo-600 focus:ring-indigo-300 border-gray-300 rounded">
                    </div>
                    <div class="ml-2 text-sm">
                        <label for="remember" class="text-gray-500">تذكرني</label>
                    </div>
                </div>

                <div class="text-sm">
                    <a href="{{ route('password-request-student.show') }}" class="font-medium text-indigo-600 hover:text-indigo-500">
                        نسيت كلمة المرور؟
                    </a>
                </div>
            </div>

            <div>
                <button type="submit"
                        class="w-full bg-navy-800 hover:bg-navy-900 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    تسجيل الدخول
                </button>
            </div>

            @if(session('success'))
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                    {{ session('success') }}
                </div>
            @endif

            @if($errors->any())
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                    @foreach($errors->all() as $error)
                        <p>{{ $error }}</p>
                    @endforeach
                </div>
            @endif
        </form>
    </div>
</body>
</html>