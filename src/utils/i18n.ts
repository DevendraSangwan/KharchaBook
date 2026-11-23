export type AppLanguage = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    // Onboarding
    welcomeTitle: 'Welcome to KharchaBook',
    welcomeSub: 'Set up your profile, language, and monthly budget to stay in control of every rupee.',
    chooseLang: 'Preferred Language',
    chooseAvatar: 'Choose Your Avatar',
    yourName: 'Your Name',
    setBudget: 'Set Your Monthly Budget (₹)',
    startTracking: 'Start Tracking Kharcha',

    // Tabs
    tabHome: 'Home',
    tabUdhaar: 'Udhaar',
    tabAnalytics: 'Analytics',
    tabProfile: 'Profile',

    // Home
    hiUser: 'Hi',
    newBtn: 'New',
    thisMonthSpent: 'THIS MONTH SPENT',
    safeDailyLimit: 'SAFE DAILY LIMIT',
    perDay: '/day',
    budgetLabel: 'Budget:',
    left: 'left',
    over: 'over',
    todaysSpend: "Today's Spend",
    totalEntries: 'Total Entries',
    searchPlaceholder: 'Search expense or category...',
    noMatching: 'No matching expenses found',
    noMatchingSub: 'Tap "+ New" above to add an expense or reset filters.',
    deleteTitle: 'Delete Expense?',
    cancel: 'Cancel',
    delete: 'Delete',

    // Add Modal
    addNewTitle: 'Add New Expense',
    category: 'Category',
    paymentMode: 'Payment Mode',
    noteOptional: 'Note (Optional)',
    notePlaceholder: 'e.g., Tea & Snacks, Metro recharge...',
    saveExpense: 'Save Expense',

    // Udhaar
    udhaarTitle: 'Split & Udhaar Book',
    udhaarSub: 'Track money lent to or borrowed from friends',
    toReceive: 'TO RECEIVE',
    toPay: 'TO PAY',
    lentBtn: 'Lent (To Receive)',
    borrowedBtn: 'Borrowed (To Pay)',
    friendPlaceholder: 'Friend name (e.g., Omli)',
    amountPlaceholder: '₹ Amount',
    reasonPlaceholder: 'Reason (e.g., Lunch split)',
    noUdhaar: 'No pending records. All settled!',
    settled: 'Settled ✓',
    settle: 'Settle',

    // Analytics
    analyticsTitle: 'Spending Analytics',
    analyticsSub: 'Category & payment mode breakdown this month',
    topCategoryTag: 'HIGHEST SPENDING',
    ofTotalSpent: 'of total monthly spending went here.',
    noAnalytics: 'Add some expenses first to see analytics.',
    paymentModesTitle: 'Payment Modes',
    categoryBreakdownTitle: 'Category Breakdown',

    // Profile
    profileTitle: 'My Profile',
    profileSub: 'Personal details, language, budget & CSV export',
    editProfileCard: 'Edit Profile, Language & Budget',
    selectAvatar: 'Select Avatar',
    monthlyLimitLabel: 'Monthly Budget Limit (₹)',
    saveChanges: 'Save Changes',
    exportTitle: 'Export Expense Report',
    exportDesc: 'Share all your transactions in CSV format via WhatsApp, Email, or Notes.',
    shareCsv: 'Share CSV Report',
    resetTitle: 'Reset Expenses',
    resetDesc: 'Delete all saved entries to start fresh.',
    clearAll: 'Clear All Expenses',
  },
  hi: {
    // Onboarding
    welcomeTitle: 'KharchaBook में स्वागत है',
    welcomeSub: 'अपनी भाषा, प्रोफ़ाइल और मासिक बजट सेट करें ताकि हर खर्च पर नियंत्रण रहे।',
    chooseLang: 'अपनी भाषा चुनें (Language)',
    chooseAvatar: 'अवतार चुनें',
    yourName: 'आपका नाम',
    setBudget: 'मासिक बजट सेट करें (₹)',
    startTracking: 'खर्चा ट्रैक करना शुरू करें',

    // Tabs
    tabHome: 'होम',
    tabUdhaar: 'उधार',
    tabAnalytics: 'एनालिटिक्स',
    tabProfile: 'प्रोफ़ाइल',

    // Home
    hiUser: 'नमस्ते',
    newBtn: 'नया',
    thisMonthSpent: 'इस महीने का खर्च',
    safeDailyLimit: 'दैनिक सुरक्षित सीमा',
    perDay: '/दिन',
    budgetLabel: 'बजट:',
    left: 'बचे हैं',
    over: 'ज़्यादा खर्च',
    todaysSpend: 'आज का खर्च',
    totalEntries: 'कुल एंट्री',
    searchPlaceholder: 'खर्चा या कैटेगरी खोजें...',
    noMatching: 'कोई खर्चा नहीं मिला',
    noMatchingSub: 'ऊपर "+ नया" दबाकर खर्चा जोड़ें या फ़िल्टर हटाएँ।',
    deleteTitle: 'खर्चा डिलीट करें?',
    cancel: 'रद्द करें',
    delete: 'डिलीट',

    // Add Modal
    addNewTitle: 'नया खर्चा जोड़ें',
    category: 'कैटेगरी',
    paymentMode: 'पेमेंट का तरीका',
    noteOptional: 'नोट (वैकल्पिक)',
    notePlaceholder: 'जैसे: चाय-नाश्ता, मेट्रो रिचार्ज...',
    saveExpense: 'खर्चा सेव करें',

    // Udhaar
    udhaarTitle: 'उधार और लेन-देन बुक',
    udhaarSub: 'दोस्तों को दिए या लिए गए पैसों का हिसाब रखें',
    toReceive: 'लेने हैं (TO RECEIVE)',
    toPay: 'देने हैं (TO PAY)',
    lentBtn: 'दिए (लेने हैं)',
    borrowedBtn: 'लिए (देने हैं)',
    friendPlaceholder: 'दोस्त का नाम (जैसे: Omli)',
    amountPlaceholder: '₹ राशि',
    reasonPlaceholder: 'वजह (जैसे: लंच शेयर)',
    noUdhaar: 'कोई बकाया उधार नहीं है। सब हिसाब साफ़ है!',
    settled: 'चुक्ता ✓',
    settle: 'चुक्ता करें',

    // Analytics
    analyticsTitle: 'खर्च एनालिटिक्स',
    analyticsSub: 'इस महीने की कैटेगरी और पेमेंट रिपोर्ट',
    topCategoryTag: 'सबसे ज़्यादा खर्च',
    ofTotalSpent: 'कुल मासिक खर्च का इसी कैटेगरी में गया है।',
    noAnalytics: 'रिपोर्ट देखने के लिए पहले कुछ खर्चे जोड़ें।',
    paymentModesTitle: 'पेमेंट मोड्स',
    categoryBreakdownTitle: 'कैटेगरी के अनुसार खर्च',

    // Profile
    profileTitle: 'मेरी प्रोफ़ाइल',
    profileSub: 'नाम, भाषा, बजट सीमा और रिपोर्ट एक्सपोर्ट',
    editProfileCard: 'प्रोफ़ाइल, भाषा और बजट बदलें',
    selectAvatar: 'अवतार चुनें',
    monthlyLimitLabel: 'मासिक बजट सीमा (₹)',
    saveChanges: 'बदलाव सेव करें',
    exportTitle: 'खर्च रिपोर्ट एक्सपोर्ट करें',
    exportDesc: 'अपने सभी लेन-देन को CSV फ़ाइल में WhatsApp या ईमेल पर शेयर करें।',
    shareCsv: 'CSV रिपोर्ट शेयर करें',
    resetTitle: 'डेटा रीसेट करें',
    resetDesc: 'नए सिरे से शुरू करने के लिए सभी खर्चे डिलीट करें।',
    clearAll: 'सभी खर्चे डिलीट करें',
  },
} as const;
