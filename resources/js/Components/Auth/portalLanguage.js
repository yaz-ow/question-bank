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
        cardTagline: 'تعلّم بثقة',
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
        account: {
            registerTitle: 'إنشاء حساب طالب',
            resetTitle: 'تعيين كلمة مرور جديدة',
            registerSubtitle: 'ابدأ رحلتك التعليمية بحسابك في بنك الأسئلة.',
            studentRecoverySubtitle:
                'أدخل رقمك الجامعي والبريد المرتبط بحسابك لإرسال رابط الاستعادة.',
            adminRecoverySubtitle:
                'أدخل البريد المرتبط بحساب الإدارة لإرسال رابط الاستعادة.',
            resetSubtitle: 'اختر كلمة مرور جديدة، ثم أكّدها للعودة إلى حسابك.',
            recoveryHeading: 'نساعدك على العودة',
            backToLogin: 'رجوع للدخول',
            fullName: 'الاسم الكامل',
            fullNamePlaceholder: 'اسمك الكامل',
            universityIdHint: 'M متبوعًا بتسعة أرقام',
            passwordNew: 'كلمة المرور الجديدة',
            passwordMinimum: 'ثمانية أحرف على الأقل',
            passwordConfirm: 'تأكيد كلمة المرور',
            passwordConfirmPlaceholder: 'أعد كتابة كلمة المرور',
            show: 'إظهار',
            hide: 'إخفاء',
            creating: 'جارٍ إنشاء الحساب…',
            sending: 'جارٍ إرسال الرابط…',
            saving: 'جارٍ حفظ كلمة المرور…',
            createAccount: 'إنشاء الحساب',
            sendResetLink: 'إرسال رابط الاستعادة',
            savePassword: 'حفظ كلمة المرور الجديدة',
            alreadyHaveAccount: 'لديك حساب بالفعل؟',
            readyToReturn: 'جاهز للعودة؟',
            expiredLink: 'انتهت صلاحية الرابط؟ اطلب رابطًا جديدًا',
        },
    },
    en: {
        brand: 'Question Bank',
        cardTagline: 'Learn with confidence',
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
        account: {
            registerTitle: 'Create a student account',
            resetTitle: 'Set a new password',
            registerSubtitle:
                'Start your learning journey with a Question Bank account.',
            studentRecoverySubtitle:
                'Enter your university ID and account email to receive a reset link.',
            adminRecoverySubtitle:
                'Enter your administration account email to receive a reset link.',
            resetSubtitle:
                'Choose and confirm a new password to return to your account.',
            recoveryHeading: 'Let’s get you back',
            backToLogin: 'Back to sign in',
            fullName: 'Full name',
            fullNamePlaceholder: 'Your full name',
            universityIdHint: 'M followed by nine digits',
            passwordNew: 'New password',
            passwordMinimum: 'At least eight characters',
            passwordConfirm: 'Confirm password',
            passwordConfirmPlaceholder: 'Re-enter your password',
            show: 'Show',
            hide: 'Hide',
            creating: 'Creating your account…',
            sending: 'Sending the link…',
            saving: 'Saving your password…',
            createAccount: 'Create account',
            sendResetLink: 'Send reset link',
            savePassword: 'Save new password',
            alreadyHaveAccount: 'Already have an account?',
            readyToReturn: 'Ready to return?',
            expiredLink: 'Link expired? Request a new one',
        },
        feedback: {
            'كلمة المرور طويلة جدًا؛ قلّل عدد الأحرف أو الرموز.': 'Your password is too long. Use fewer characters or symbols.',
            'كلمة المرور تحتوي على رمز غير صالح.': 'Your password contains an invalid character.',
            'بيانات الدخول غير صحيحة': 'The sign-in details are incorrect.',
            'حسابك غير نشط أو تم تعطيله': 'Your account is inactive or has been disabled.',
            'غير مسموح لك بالوصول إلى هذه الصفحة': 'You do not have permission to access this page.',
            'يجب تسجيل الدخول أولًا': 'Please sign in first.',
            'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني':
                'If the details are correct, a password reset link will be sent to your email.',
            'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول':
                'Your password has been reset. You can now sign in.',
            'حسابك تم إنشاؤه بنجاح':
                'Your account has been created successfully.',
            'الحقائق غير صحيحة': 'The account details are incorrect.',
        },
    },
};

/** Translate the existing account feedback without changing its server-side meaning. */
export function translatePortalFeedback(message, language) {
    return portalMessages[language]?.feedback?.[message] ?? message;
}
