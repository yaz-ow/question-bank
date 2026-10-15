const STORAGE_KEY = 'question-bank.language';

export function readPortalLanguage() {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
    } catch {
        return 'ar';
    }
}

export function savePortalLanguage(language) {
    try {
        window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // The selection still works for this visit if storage is unavailable.
    }
}

export const portalMessages = {
    ar: {
        brand: 'بنك الأسئلة',
        welcome: 'مرحبًا بك',
        heading: 'رحلتك تبدأ من هنا',
        tagline: 'تعلّم، تدرّب، وتابع تقدّمك.',
        footer: 'بنك الأسئلة · تعلّم بثقة',
        language: 'لغة الواجهة',
        student: 'الطالب',
        admin: 'الإدارة',
        studentPortal: 'بوابة الطالب',
        adminPortal: 'بوابة الإدارة',
        openStudent: 'فتح تسجيل دخول الطالب',
        openAdmin: 'فتح تسجيل دخول الإدارة',
        studentLogin: 'دخول الطالب',
        adminLogin: 'دخول الإدارة',
        welcomeBack: 'مرحبًا بعودتك',
        studentSubtitle: 'سجّل دخولك وواصل رحلتك التعليمية.',
        adminSubtitle: 'إدارة المقررات والأسئلة من مكان واحد.',
        studentForm: 'تسجيل دخول الطالب',
        adminForm: 'تسجيل دخول الإدارة',
        back: 'رجوع',
        universityId: 'الرقم الجامعي',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        passwordPlaceholder: 'أدخل كلمة المرور',
        hidePassword: 'إخفاء كلمة المرور',
        showPassword: 'إظهار كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        signingIn: 'جارٍ تسجيل الدخول…',
        signIn: 'تسجيل الدخول',
        noAccount: 'ليس لديك حساب؟',
        register: 'إنشاء حساب',
    },
    en: {
        brand: 'Question Bank',
        welcome: 'Welcome',
        heading: 'Your journey starts here',
        tagline: 'Learn, practise, and track your progress.',
        footer: 'Question Bank · Learn with confidence',
        language: 'Interface language',
        student: 'Student',
        admin: 'Administration',
        studentPortal: 'Student portal',
        adminPortal: 'Administration portal',
        openStudent: 'Open student sign in',
        openAdmin: 'Open administration sign in',
        studentLogin: 'Student sign in',
        adminLogin: 'Administration sign in',
        welcomeBack: 'Welcome back',
        studentSubtitle: 'Sign in and continue your learning journey.',
        adminSubtitle: 'Manage courses and questions in one place.',
        studentForm: 'Student sign in',
        adminForm: 'Administration sign in',
        back: 'Back',
        universityId: 'University ID',
        email: 'Email address',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        hidePassword: 'Hide password',
        showPassword: 'Show password',
        forgotPassword: 'Forgot your password?',
        signingIn: 'Signing in…',
        signIn: 'Sign in',
        noAccount: 'Don’t have an account?',
        register: 'Create an account',
    },
};
