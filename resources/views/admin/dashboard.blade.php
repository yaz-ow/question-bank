<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة المسؤول - بنك الأسئلة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            @apply bg-gray-50;
        }
    </style>
</head>
<body class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-navy-800 text-white">
        <div class="p-6">
            <h1 class="text-2xl font-bold">بنك الأسئلة</h1>
            <p class="text-sm text-navy-200 mt-2">مسؤول</p>
        </div>
        <nav class="mt-6">
            <a href="#" class="block px-4 py-3 text-sm font-medium hover:bg-navy-700">
                لوحة التحكم
            </a>
            <a href="#" class="block px-4 py-3 text-sm font-medium hover:bg-navy-700">
                إدارة الدورات
            </a>
            <a href="#" class="block px-4 py-3 text-sm font-medium hover:bg-navy-700">
                إدارة الطلاب
            </a>
            <a href="#" class="block px-4 py-3 text-sm font-medium hover:bg-navy-700">
                إنشاء مسؤولين جدد
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 p-6">
        <header class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            <p class="text-sm text-gray-500">مرحبًا {{ auth()->user()->name }}!</p>
        </header>

        <div class="grid gap-6 md:grid-cols-3">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-lg font-semibold mb-4">إدارة الدورات</h2>
                <p class="text-gray-600">إنشاء وتعديل وحذف الدورات الأكاديمية</p>
                <a href="#" class="mt-4 inline-block text-navy-600 hover:text-navy-800 font-medium">
                    إدارة الدورات →
                </a>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-lg font-semibold mb-4">إدارة الطلاب</h2>
                <p class="text-gray-600">عرض وتعديل حالة حسابات الطلاب</p>
                <a href="#" class="mt-4 inline-block text-navy-600 hover:text-navy-800 font-medium">
                    إدارة الطلاب →
                </a>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-lg font-semibold mb-4">إنشاء مسؤولين</h2>
                <p class="text-gray-600">إنشاء حسابات مسؤولة وجديدة (requires special code)</p>
                <a href="#" class="mt-4 inline-block text-navy-600 hover:text-navy-800 font-medium">
                    إنشاء مسؤولين →
                </a>
            </div>
        </div>
    </div>
</body>
</html>