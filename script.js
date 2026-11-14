let products = [];
let productsLoaded = false;
let deliveryInfo = {};
let productGalleryKeyHandler = null;
const fallbackProducts = [
  {
    id: 5,
    name: "Portable Harmonium",
    category: "harmonium",
    price: 21999,
    details: "9 stop knobs, coupler, integrated scale changer",
    availability: "available",
    images: [
      "assets/images/harmonium_1.jpg",
      "assets/images/harmonium_2.jpg",
      "assets/images/harmonium_3.webp",
      "assets/images/harmonium_4.jpg",
      "assets/images/harmonium_5.avif"
    ],
    video_url: "assets/videos/harmonium-making.mp4"
  }
];

const defaultVideos = [
  { id: 1, titleKey: "videoHarmonium", url: "assets/videos/harmonium-making.mp4" }
];

const translations = {
  en: {
    dropdownMyProfile: "My Profile",
    navProducts: "Instruments",
    navAbout: "About",
    navContact: "Contact",
    navAdmin: "Admin",
    cart: "Cart",
    brandTagline: "Destination for every musical journey",
    heroEyebrow: "A tradition carried in every note",
    heroTitle: "Find your voice in the harmonium",
    heroDesc: "Explore harmoniums for daily riyaaz, bhajan, and accompaniment. Browse the available model, its photos, and features.",
    shopInstruments: "Explore Harmoniums",
    heroCardTitle: "Choose for your music",
    heroCardDesc: "Compare the listed features, browse instrument photos, or ask us about the setup that suits your music.",
    profileTitle: "Your Profile",
    profileGreeting: "Welcome back,",
    profileSince: "Member since",
    profileMobileLabel: "Mobile number",
    profileAddressLabel: "Address",
    profileSinceLabel: "Member since",
    profileEditButton: "Edit profile",
    profileEditTitle: "Edit profile",
    profileSaveChanges: "Save changes",
    profileUpdateSuccess: "Profile updated.",
    profileUpdateError: "Unable to update profile.",
    profileMissingValue: "Not added yet",
    featuredInstruments: "The Swayamvani Collection",
    allProductTitle: "Our Instruments",
    allProductIntro: "Browse the instruments currently available, with product details and photos.",
    catalogEmpty: "No instruments are listed right now.",
    categoryEmpty: "There are no instruments in this category.",
    noProductMatches: "No instruments match these filters.",
    catalogSearchLabel: "Search instruments",
    catalogSearchPlaceholder: "Name, type, or feature",
    catalogAvailabilityLabel: "Availability",
    availabilityAll: "Any availability",
    availabilityInStock: "In stock",
    availabilityMadeToOrder: "Made to order",
    availabilityOutOfStock: "Out of stock",
    catalogStyleLabel: "Playing style",
    styleAll: "Any style",
    styleRiyaaz: "Riyaaz / practice",
    styleBhajan: "Bhajan / devotional",
    styleAccompaniment: "Vocal accompaniment",
    styleClassical: "Classical music",
    catalogSortLabel: "Sort by",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortAvailability: "Availability",
    collectionEyebrow: "Made for your music",
    collectionIntro: "Explore the current model, its details, and instrument photos.",
    productSpecsLabel: "Key specifications",
    shippingAsk: "Ask about delivery",
    deliveryTitle: "Delivery details",
    deliveryAsk: "Ask about delivery",
    deliveryShippingLabel: "Shipping charges",
    deliveryLocationsLabel: "Serviceable locations",
    deliveryDispatchLabel: "Estimated dispatch time",
    deliveryPackagingLabel: "Packaging details",
    filter_all: "All instruments",
    filter_string: "String",
    filter_percussion: "Percussion",
    filter_wind: "Wind",
    filter_keyboard: "Keyboard",
    aboutTitle: "A harmonium for your music",
    aboutPoint1: "See the available model and its listed features in one place",
    aboutPoint2: "Browse detailed product photos before you decide",
    aboutPoint3: "Watch the harmonium making video",
    aboutPoint4: "Ask us if you need help understanding the setup",
    aboutHelpTitle: "Need help choosing?",
    aboutHelpDesc: "Tell us what you play and which features matter. Send an inquiry and we’ll help you understand the listed setup.",
    videosTitle: "Harmonium Making",
    videosDesc: "Take a closer look at the craft behind the harmonium.",
    allVideosTitle: "Instrument Making Videos",
    allVideosDesc: "Take a closer look at how our instruments are made.",
    videoHarmonium: "Harmonium Making Process",
    videoLabelTitle: "Video Title",
    videoLabelUrl: "Video URL",
    videoAdd: "Add Video",
    videoDelete: "Delete",
    videoAdded: "Video added.",
    videoDeleted: "Video deleted.",
    videosEmpty: "No videos added yet.",
    videoLoadFailed: "Could not load videos.",
    videoSaveFailed: "Could not save video changes.",
    watchMakingVideo: "Watch Making Video",
    contactTitle: "Questions about a harmonium?",
    labelName: "Name",
    labelEmail: "Email",
    labelMessage: "Message",
    sendInquiry: "Send Inquiry",
    yourCart: "Your Cart",
    total: "Total",
    closeCart: "Close Cart",
    checkout: "Proceed to Checkout",
    addToCart: "Add to Cart",
    remove: "Remove",
    cartEmpty: "Your cart is empty.",
    cartEmptyAlert: "Your cart is empty.",
    loadingInstruments: "Loading instruments...",
    loadFailed: "Could not load products.",
    sending: "Sending...",
    inquirySent: "Inquiry sent successfully.",
    inquiryFailed: "Failed to send inquiry.",
    paymentSuccess: "Payment success. We will contact you to confirm delivery.",
    checkoutUnavailable: "Razorpay checkout unavailable",
    checkoutFailed: "Checkout failed",
    customerTitle: "Customer Account",
    customerLogin: "Login",
    customerRegister: "Create Account",
    customerPassword: "Password",
    customerForgotPassword: "Forgot password?",
    customerForgotDesc: "Enter your email and, if an account exists, we’ll send a secure password reset link.",
    customerSendReset: "Send reset instructions",
    customerBackToLogin: "Back to login",
    customerUpdatePasswordLink: "Update password",
    customerUpdatePassword: "Update password",
    customerUpdatePasswordDesc: "Choose a strong new password and confirm it below.",
    customerConfirmPassword: "Confirm password",
    customerUpdatePasswordSuccess: "Password updated. Please log in again.",
    customerUpdatePasswordError: "Could not update password.",
    customerForgotPasswordSent: "If an account exists, we’ve emailed a password reset link.",
    customerForgotPasswordError: "Failed to send reset email.",
    customerResetTitle: "Set a new password",
    customerResetDesc: "Choose a new password for your account.",
    customerResetSubmit: "Reset password",
    customerResetSuccess: "Your password has been reset. Sign in with your new password.",
    customerResetInvalid: "This reset link is invalid or expired. Request a new one.",
    customerLogout: "Logout",
    customerAuthSuccess: "You are logged in.",
    customerRegisterSuccess: "Account successfully created and your login details have been emailed to you.",
    customerAuthFailed: "Customer authentication failed.",
    cartDiscountGuestHint: "Exclusive discount around the corner—please login to claim it.",
    offerTitle: "Exclusive Customer Offers",
    offerDesc: "Login now to unlock instant savings and complimentary guidance from our master craftsmen.",
    offerDiscountTitle: "",
    offerDiscountDesc: "",
    offerLessonsTitle: "",
    offerLessonsDesc: "",
    discountedPriceLabel: "Discounted price",
    youSavedLabel: "You saved",
    couponLabel: "Coupon",
    applyCoupon: "Apply",
    couponPlaceholder: "Enter code",
    couponApplied: "Coupon applied.",
    couponInvalid: "Invalid coupon.",
    couponHint: "Use the admin coupon to save more.",
    couponUnavailable: "No coupon available right now."
  },
  mr: {
    dropdownMyProfile: "माझे प्रोफाइल",
    navProducts: "वाद्ये",
    navAbout: "आमच्याबद्दल",
    navContact: "संपर्क",
    navAdmin: "ॲडमिन",
    cart: "कार्ट",
    brandTagline: "प्रत्येक संगीत प्रवासाचे ठिकाण",
    heroEyebrow: "प्रत्येक सुरात जपलेली परंपरा",
    heroTitle: "हार्मोनियम मधून शोधा तुमचा स्वर",
    heroDesc: "रोजच्या रियाज, भजन आणि साथीसाठी हार्मोनियम पाहा. उपलब्ध मॉडेल, फोटो आणि वैशिष्ट्ये जाणून घ्या.",
    shopInstruments: "हार्मोनियम पाहा",
    heroCardTitle: "तुमच्या संगीतासाठी निवडा",
    heroCardDesc: "वैशिष्ट्यांची तुलना करा, फोटो पाहा किंवा तुमच्या संगीताला योग्य सेटअप बद्दल विचारा.",
    profileTitle: "तुमचे प्रोफाइल",
    profileGreeting: "पुन्हा स्वागत आहे,",
    profileSince: "सदस्यत्वाची सुरुवात",
    featuredInstruments: "हार्मोनियम संग्रह",
    allProductTitle: "आमची वाद्ये",
    allProductIntro: "उपलब्ध वाद्ये, त्यांची माहिती आणि फोटो पाहा.",
    catalogEmpty: "सध्या कोणतीही वाद्ये उपलब्ध नाहीत.",
    categoryEmpty: "या प्रकारात वाद्य उपलब्ध नाही.",
    noProductMatches: "या फिल्टरशी जुळणारी वाद्ये नाहीत.",
    catalogSearchLabel: "वाद्य शोधा",
    catalogSearchPlaceholder: "नाव, प्रकार किंवा वैशिष्ट्य",
    catalogAvailabilityLabel: "उपलब्धता",
    availabilityAll: "कोणतीही उपलब्धता",
    availabilityInStock: "साठ्यात उपलब्ध",
    availabilityMadeToOrder: "ऑर्डरनुसार तयार",
    availabilityOutOfStock: "साठ्यात नाही",
    catalogStyleLabel: "वादनाची शैली",
    styleAll: "कोणतीही शैली",
    styleRiyaaz: "रियाज / सराव",
    styleBhajan: "भजन / भक्तिसंगीत",
    styleAccompaniment: "गायनासाठी साथ",
    styleClassical: "शास्त्रीय संगीत",
    catalogSortLabel: "क्रमवारी",
    sortFeatured: "वैशिष्ट्यपूर्ण",
    sortPriceAsc: "कमी ते जास्त किंमत",
    sortPriceDesc: "जास्त ते कमी किंमत",
    sortAvailability: "उपलब्धतेनुसार",
    collectionEyebrow: "तुमच्या संगीतासाठी",
    collectionIntro: "उपलब्ध मॉडेल, त्याची माहिती आणि वाद्याचे फोटो पाहा.",
    productSpecsLabel: "मुख्य वैशिष्ट्ये",
    shippingAsk: "डिलिव्हरीबद्दल विचारा",
    deliveryTitle: "डिलिव्हरीची माहिती",
    deliveryAsk: "डिलिव्हरीबद्दल विचारा",
    deliveryShippingLabel: "शिपिंग शुल्क",
    deliveryLocationsLabel: "डिलिव्हरी उपलब्ध ठिकाणे",
    deliveryDispatchLabel: "अंदाजे पाठवण्याची वेळ",
    deliveryPackagingLabel: "पॅकेजिंगची माहिती",
    filter_all: "सर्व वाद्ये",
    filter_string: "तंतुवाद्य",
    filter_percussion: "तालवाद्य",
    filter_wind: "वायुवाद्य",
    filter_keyboard: "कीबोर्ड",
    aboutTitle: "तुमच्या संगीतासाठी हार्मोनियम",
    aboutPoint1: "उपलब्ध मॉडेल आणि त्याची वैशिष्ट्ये एका ठिकाणी पाहा",
    aboutPoint2: "निर्णय घेण्यापूर्वी उत्पादनाचे फोटो पाहा",
    aboutPoint3: "हार्मोनियम बनवण्याचा व्हिडिओ पाहा",
    aboutPoint4: "सेटअप समजून घेण्यासाठी आम्हाला विचारा",
    aboutHelpTitle: "योग्य वाद्य निवडण्यात मदत हवी?",
    aboutHelpDesc: "तुम्ही काय वाजवता आणि कोणती वैशिष्ट्ये महत्त्वाची आहेत ते सांगा. सेटअप समजून घेण्यासाठी आम्हाला संदेश पाठवा.",
    videosTitle: "हार्मोनियम निर्मिती",
    videosDesc: "हार्मोनियम घडवण्याच्या कारागिरीची झलक पाहा.",
    allVideosTitle: "वाद्यनिर्मिती व्हिडिओ",
    allVideosDesc: "आमची वाद्ये कशी तयार होतात याची झलक पाहा.",
    videoHarmonium: "हार्मोनियम बनवण्याची प्रक्रिया",
    videoLabelTitle: "व्हिडिओ शीर्षक",
    videoLabelUrl: "व्हिडिओ URL",
    videoAdd: "व्हिडिओ जोडा",
    videoDelete: "हटवा",
    videoAdded: "व्हिडिओ जोडला.",
    videoDeleted: "व्हिडिओ हटवला.",
    videosEmpty: "अजून व्हिडिओ जोडलेले नाहीत.",
    videoLoadFailed: "व्हिडिओ लोड करता आले नाहीत.",
    videoSaveFailed: "व्हिडिओ बदल सेव्ह करता आले नाहीत.",
    watchMakingVideo: "बनवण्याचा व्हिडिओ पहा",
    contactTitle: "हार्मोनियमबद्दल प्रश्न आहेत?",
    labelName: "नाव",
    labelEmail: "ईमेल",
    labelMessage: "संदेश",
    sendInquiry: "चौकशी पाठवा",
    yourCart: "तुमचे कार्ट",
    total: "एकूण",
    closeCart: "कार्ट बंद करा",
    checkout: "चेकआउट कडे जा",
    addToCart: "कार्ट मध्ये जोडा",
    remove: "काढा",
    cartEmpty: "तुमचे कार्ट रिकामे आहे.",
    cartEmptyAlert: "तुमचे कार्ट रिकामे आहे.",
    loadingInstruments: "वाद्ये लोड होत आहेत...",
    loadFailed: "उत्पादने लोड करता आली नाहीत.",
    sending: "पाठवत आहे...",
    inquirySent: "चौकशी यशस्वीपणे पाठवली.",
    inquiryFailed: "चौकशी पाठवता आली नाही.",
    paymentSuccess: "पेमेंट यशस्वी. डिलिव्हरीसाठी आम्ही तुमच्याशी संपर्क करू.",
    checkoutUnavailable: "Razorpay चेकआउट उपलब्ध नाही",
    checkoutFailed: "चेकआउट अयशस्वी",
    customerTitle: "ग्राहक खाते",
    customerLogin: "ग्राहक लॉगिन",
    customerRegister: "खाते तयार करा",
    customerPassword: "पासवर्ड",
    customerForgotPassword: "पासवर्ड भूल गए?",
    customerForgotDesc: "तुमचा ईमेल द्या. खाते असल्यास, आम्ही सुरक्षित पासवर्ड रीसेट लिंक पाठवू.",
    customerSendReset: "रीसेट सूचना पाठवा",
    customerBackToLogin: "लॉगिनवर परत जा",
    customerForgotPasswordSent: "खाते अस्तित्वात असल्यास, आम्ही पासवर्ड रीसेट लिंक ईमेल केली आहे.",
    customerForgotPasswordError: "रीसेट ईमेल पाठवताना त्रुटी.",
    customerResetTitle: "नवीन पासवर्ड तयार करा",
    customerResetDesc: "तुमच्या खात्यासाठी नवीन पासवर्ड निवडा.",
    customerResetSubmit: "पासवर्ड रीसेट करा",
    customerResetSuccess: "पासवर्ड रीसेट झाला. नवीन पासवर्डने लॉगिन करा.",
    customerResetInvalid: "ही रीसेट लिंक अवैध किंवा कालबाह्य आहे. नवीन लिंक मागवा.",
    customerLogout: "लॉगआउट",
    customerAuthSuccess: "तुम्ही लॉगिन आहात.",
    customerRegisterSuccess: "खाते यशस्वीरित्या तयार झाले आहे आणि आपला युजर आयडी व पासवर्ड ईमेलवर पाठवला गेला आहे.",
    customerAuthFailed: "ग्राहक प्रमाणीकरण अयशस्वी.",
    customerUpdatePasswordLink: "पासवर्ड अपडेट करा",
    customerUpdatePassword: "पासवर्ड अपडेट करा",
    customerUpdatePasswordDesc: "एक मजबूत नवीन पासवर्ड निवडा आणि तो खाली पुष्टी करा.",
    customerConfirmPassword: "पासवर्ड पुष्टी करा",
    customerUpdatePasswordSuccess: "पासवर्ड अद्ययावत झाला. कृपया पुन्हा लॉगिन करा.",
    customerUpdatePasswordError: "पासवर्ड अद्ययावत करण्यात अयशस्वी.",
    cartDiscountGuestHint: "कार्टमध्ये खास सूट आहे—कृपया लॉगिन करा.",
    offerTitle: "ग्राहकांसाठी खास ऑफर्स",
  offerDesc: "लॉगिन करून तत्काळ सूट आणि आमच्या मास्टर कारीगरांच्या मार्गदर्शनाचा लाभ घ्या.",
  offerDiscountTitle: "",
  offerDiscountDesc: "",
  offerLessonsTitle: "",
  offerLessonsDesc: "",
    discountedPriceLabel: "सुट केलेली किंमत",
    youSavedLabel: "तुम्ही वाचवले",
    couponLabel: "कूपन",
    applyCoupon: "लागू करा",
    couponPlaceholder: "कोड टाका",
    couponApplied: "कूपन लागू झाले.",
    couponInvalid: "कूपन चुकीचे आहे.",
    couponHint: "अधिक सवलतीसाठी कूपन वापरा.",
    couponUnavailable: "सध्या कोणतेही कूपन नाही.",
  },
  hi: {
    dropdownMyProfile: "मेरी प्रोफ़ाइल",
    navProducts: "वाद्य",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क",
    navAdmin: "एडमिन",
    cart: "कार्ट",
    brandTagline: "हर संगीत यात्रा का ठिकाना",
    heroEyebrow: "हर सुर में संजोई परंपरा",
    heroTitle: "हारमोनियम में अपनी आवाज़ खोजें",
    heroDesc: "रोज़ के रियाज़, भजन और संगत के लिए हारमोनियम देखें। उपलब्ध मॉडल, तस्वीरें और खूबियाँ जानें।",
    shopInstruments: "हारमोनियम देखें",
    heroCardTitle: "अपने संगीत के लिए चुनें",
    heroCardDesc: "दिए गए फीचर्स की तुलना करें, तस्वीरें देखें या अपने संगीत के अनुसार सेटअप के बारे में पूछें।",
    profileTitle: "आपकी प्रोफ़ाइल",
    profileGreeting: "फिर से स्वागत है,",
    profileSince: "सदस्यता प्रारंभ",
    profileMobileLabel: "मोबाइल नंबर",
    profileAddressLabel: "पता",
    profileSinceLabel: "सदस्यता की तारीख",
    profileEditButton: "प्रोफ़ाइल संपादित करें",
    profileEditTitle: "प्रोफ़ाइल संपादित करें",
    profileSaveChanges: "बदलाव सहेजें",
    profileUpdateSuccess: "प्रोफ़ाइल अपडेट हो गई।",
    profileUpdateError: "प्रोफ़ाइल अपडेट करने में विफल।",
    profileMissingValue: "अभी नहीं जोड़ा गया",
    featuredInstruments: "हारमोनियम संग्रह",
    allProductTitle: "हमारे वाद्य",
    allProductIntro: "उपलब्ध वाद्य, उनकी जानकारी और तस्वीरें देखें।",
    catalogEmpty: "अभी कोई वाद्य सूचीबद्ध नहीं है।",
    categoryEmpty: "इस श्रेणी में कोई वाद्य नहीं है।",
    noProductMatches: "इन फ़िल्टर से मेल खाने वाला कोई वाद्य नहीं है।",
    catalogSearchLabel: "वाद्य खोजें",
    catalogSearchPlaceholder: "नाम, प्रकार या विशेषता",
    catalogAvailabilityLabel: "उपलब्धता",
    availabilityAll: "कोई भी उपलब्धता",
    availabilityInStock: "स्टॉक में",
    availabilityMadeToOrder: "ऑर्डर पर बनेगा",
    availabilityOutOfStock: "स्टॉक में नहीं",
    catalogStyleLabel: "वादन शैली",
    styleAll: "कोई भी शैली",
    styleRiyaaz: "रियाज़ / अभ्यास",
    styleBhajan: "भजन / भक्ति संगीत",
    styleAccompaniment: "गायन संगत",
    styleClassical: "शास्त्रीय संगीत",
    catalogSortLabel: "क्रम से दिखाएँ",
    sortFeatured: "विशेष",
    sortPriceAsc: "कम से ज़्यादा कीमत",
    sortPriceDesc: "ज़्यादा से कम कीमत",
    sortAvailability: "उपलब्धता",
    collectionEyebrow: "आपके संगीत के लिए",
    collectionIntro: "उपलब्ध मॉडल, उसकी जानकारी और वाद्य की तस्वीरें देखें।",
    productSpecsLabel: "मुख्य विशेषताएँ",
    shippingAsk: "डिलीवरी के बारे में पूछें",
    deliveryTitle: "डिलीवरी की जानकारी",
    deliveryAsk: "डिलीवरी के बारे में पूछें",
    deliveryShippingLabel: "शिपिंग शुल्क",
    deliveryLocationsLabel: "डिलीवरी वाले स्थान",
    deliveryDispatchLabel: "अनुमानित भेजने का समय",
    deliveryPackagingLabel: "पैकेजिंग की जानकारी",
    filter_all: "सभी वाद्य",
    filter_string: "तार वाद्य",
    filter_percussion: "ताल वाद्य",
    filter_wind: "वायु वाद्य",
    filter_keyboard: "कीबोर्ड",
    aboutTitle: "आपके संगीत के लिए हारमोनियम",
    aboutPoint1: "उपलब्ध मॉडल और उसके फीचर्स एक जगह देखें",
    aboutPoint2: "फैसला करने से पहले उत्पाद की तस्वीरें देखें",
    aboutPoint3: "हारमोनियम बनाने का वीडियो देखें",
    aboutPoint4: "सेटअप समझने में मदद के लिए हमसे पूछें",
    aboutHelpTitle: "सही वाद्य चुनने में मदद चाहिए?",
    aboutHelpDesc: "आप क्या बजाते हैं और कौन-से फीचर जरूरी हैं, हमें बताएं। सेटअप समझने के लिए संदेश भेजें।",
    videosTitle: "हारमोनियम निर्माण",
    videosDesc: "हारमोनियम बनाने की कारीगरी को करीब से देखें।",
    allVideosTitle: "वाद्य बनाने के वीडियो",
    allVideosDesc: "देखें हमारे वाद्य कैसे बनाए जाते हैं।",
    videoHarmonium: "हारमोनियम बनाने की प्रक्रिया",
    videoLabelTitle: "वीडियो शीर्षक",
    videoLabelUrl: "वीडियो URL",
    videoAdd: "वीडियो जोड़ें",
    videoDelete: "हटाएं",
    videoAdded: "वीडियो जोड़ दिया गया।",
    videoDeleted: "वीडियो हटाया गया।",
    videosEmpty: "अभी कोई वीडियो नहीं जोड़ा गया है।",
    videoLoadFailed: "वीडियो लोड नहीं हो सके।",
    videoSaveFailed: "वीडियो बदलाव सेव नहीं हुए।",
    watchMakingVideo: "बनाने का वीडियो देखें",
    contactTitle: "हारमोनियम के बारे में सवाल हैं?",
    labelName: "नाम",
    labelEmail: "ईमेल",
    labelMessage: "संदेश",
    sendInquiry: "चौकशी भेजें",
    yourCart: "आपका कार्ट",
    total: "कुल",
    closeCart: "कार्ट बंद करें",
    checkout: "चेकआउट पर जाएं",
    addToCart: "कार्ट में जोड़ें",
    remove: "हटाएं",
    cartEmpty: "आपका कार्ट खाली है।",
    cartEmptyAlert: "आपका कार्ट खाली है।",
    loadingInstruments: "वाद्य लोड हो रहे हैं...",
    loadFailed: "उत्पाद लोड नहीं हो सके।",
    sending: "भेजा जा रहा है...",
    inquirySent: "चौकशी सफलतापूर्वक भेजी गई।",
    inquiryFailed: "चौकशी भेजने में विफल।",
    paymentSuccess: "भुगतान सफल। डिलीवरी की पुष्टि के लिए हम आपसे संपर्क करेंगे।",
    checkoutUnavailable: "Razorpay चेकआउट उपलब्ध नहीं है",
    checkoutFailed: "चेकआउट विफल",
    customerTitle: "ग्राहक खाता",
    customerLogin: "ग्राहक लॉगिन",
    customerRegister: "खाता बनाएं",
    customerPassword: "पासवर्ड",
    customerForgotPassword: "पासवर्ड भूल गए?",
    customerForgotDesc: "अपना ईमेल डालें। खाता मौजूद होने पर हम सुरक्षित पासवर्ड रीसेट लिंक भेजेंगे।",
    customerSendReset: "रीसेट निर्देश भेजें",
    customerBackToLogin: "लॉगिन पर वापस जाएं",
    customerForgotPasswordSent: "यदि खाता मौजूद है, तो हमने पासवर्ड रीसेट लिंक ईमेल किया है।",
    customerForgotPasswordError: "रीसेट ईमेल भेजने में त्रुटि।",
    customerResetTitle: "नया पासवर्ड बनाएँ",
    customerResetDesc: "अपने खाते के लिए नया पासवर्ड चुनें।",
    customerResetSubmit: "पासवर्ड रीसेट करें",
    customerResetSuccess: "पासवर्ड रीसेट हो गया। नए पासवर्ड से लॉगिन करें।",
    customerResetInvalid: "यह रीसेट लिंक अमान्य या समाप्त हो गई है। नई लिंक माँगें।",
    customerLogout: "लॉगआउट",
    customerAuthSuccess: "आप लॉगिन हैं।",
    customerAuthFailed: "ग्राहक प्रमाणीकरण विफल।",
    customerUpdatePasswordLink: "पासवर्ड अपडेट करें",
    customerUpdatePassword: "पासवर्ड अपडेट करें",
    customerUpdatePasswordDesc: "एक मजबूत नया पासवर्ड चुनें और नीचे पक्की करें।",
    customerConfirmPassword: "पासवर्ड की पुष्टि करें",
    customerUpdatePasswordSuccess: "पासवर्ड अपडेट हो गया। कृपया फिर लॉगिन करें।",
    customerUpdatePasswordError: "पासवर्ड अपडेट करने में विफल।",
    offerTitle: "ग्राहक ऑफ़र",
  offerDesc: "अब लॉगिन करें और तुरंत बचत व हमारे मास्टर संगीतकारों की मार्गदर्शित सहायता पाएं।",
  offerDiscountTitle: "",
  offerDiscountDesc: "",
  offerLessonsTitle: "",
  offerLessonsDesc: "",
    discountedPriceLabel: "छूट वाली कीमत",
    youSavedLabel: "आपने बचाए",
    couponLabel: "कूपन",
    applyCoupon: "लागू करें",
    couponPlaceholder: "कोड दर्ज करें",
    couponApplied: "कूपन लागू हो गया।",
    couponInvalid: "कूपन मान्य नहीं है।",
    couponHint: "अधिक छूट के लिए कूपन लगाएं।",
    couponUnavailable: "इस समय कोई कूपन उपलब्ध नहीं है।",
  }
};

const state = {
  cart: [],
  filter: "all",
  catalogSort: "default",
  language: "en",
  customer: null,
  videos: [],
  couponConfig: { code: null, percent: 0 },
  coupon: { applied: false, code: null, percent: 0 },
  activeOfferType: null
};

const customerStateSubscribers = [];
window.subscribeCustomerState = function (fn) {
  if (typeof fn === "function") {
    customerStateSubscribers.push(fn);
    fn(state.customer);
  }
};
function notifyCustomerState() {
  customerStateSubscribers.forEach((fn) => {
    try {
      fn(state.customer);
    } catch (err) {
      console.error("customer state subscriber error", err);
    }
  });
}

const productGrid = document.getElementById("productGrid");
const catalogFilters = document.getElementById("catalogFilters");
const catalogSort = document.getElementById("catalogSort");
const catalogTitle = document.getElementById("catalogTitle");
const catalogIntro = document.getElementById("catalogIntro");
const videosSectionTitle = document.getElementById("videosSectionTitle");
const videosSectionDesc = document.getElementById("videosSectionDesc");
productGrid?.addEventListener("click", (event) => {
  const thumbnail = event.target.closest("[data-gallery-image]");
  if (thumbnail) {
    event.preventDefault();
    event.stopPropagation();
    const card = thumbnail.closest(".product-card");
    const mainImage = card?.querySelector("[data-gallery-main]");
    if (mainImage) mainImage.src = thumbnail.dataset.galleryImage;
    card?.querySelectorAll(".product-thumbnail").forEach((button) => {
      const active = button === thumbnail;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    return;
  }

  if (event.target.closest(".harmonium-inquiry-link")) event.stopPropagation();
});
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartSavingsEl = document.getElementById("cartSavings");
const cartDiscountHintEl = document.getElementById("cartDiscountHint");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCartFooter = document.getElementById("closeCartFooter");
const couponCodeInput = document.getElementById("couponCodeInput");
const couponStatusEl = document.getElementById("couponStatus");
const couponApplyBtn = document.getElementById("couponApplyBtn");
const inquiryForm = document.getElementById("inquiryForm");
const formStatus = document.getElementById("formStatus");
const langSwitcher = document.getElementById("langSwitcher");
const brandText = document.getElementById("brandText");
const brandLink = document.querySelector(".brand");
const customerAuthBtn = document.getElementById("customerAuthBtn");
const customerGreeting = document.getElementById("customerGreeting");
const customerModal = document.getElementById("customerModal");
const closeCustomerModal = document.getElementById("closeCustomerModal");
const customerLoginForm = document.getElementById("customerLoginForm");
const customerRegisterForm = document.getElementById("customerRegisterForm");
const customerResetForm = document.getElementById("customerResetForm");
const customerResetPasswordInput = document.getElementById("customerResetPassword");
const customerResetConfirmPasswordInput = document.getElementById("customerResetConfirmPassword");
const customerResetStatus = document.getElementById("customerResetStatus");
const backToLoginFromReset = document.getElementById("backToLoginFromReset");
let passwordResetToken = new URLSearchParams(window.location.search).get("reset_token") || "";
const showRegisterLink = document.getElementById("showRegisterLink");
const backToLoginLink = document.getElementById("backToLoginLink");
const customerUpdateForm = document.getElementById("customerUpdateForm");
const customerNewPasswordInput = document.getElementById("customerNewPassword");
const customerConfirmPasswordInput = document.getElementById("customerConfirmPassword");
const customerUpdateStatus = document.getElementById("customerUpdateStatus");
const backToLoginFromUpdate = document.getElementById("backToLoginFromUpdate");
const customerForgotForm = document.getElementById("customerForgotForm");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const customerForgotEmailInput = document.getElementById("customerForgotEmail");
const customerForgotStatus = document.getElementById("customerForgotStatus");
const backToLoginFromForgot = document.getElementById("backToLoginFromForgot");
const customerLoginEmailInput = document.getElementById("customerLoginEmail");
const customerLoginPasswordInput = document.getElementById("customerLoginPassword");
const customerLoginStatus = document.getElementById("customerLoginStatus");
const customerRegisterStatus = document.getElementById("customerRegisterStatus");
const videoGrid = document.getElementById("videoGrid");
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const productModalTitle = document.getElementById("productModalTitle");
const productModalMeta = document.getElementById("productModalMeta");
const productMediaList = document.getElementById("productMediaList");
const productModalAddToCart = document.getElementById("productModalAddToCart");
const hasBackend = window.location.protocol === "http:" || window.location.protocol === "https:";
const productDropdownButton = document.getElementById("productDropdownButton");
const productDropdownMenu = document.getElementById("productDropdownMenu");
let isProductDropdownOpen = false;
const customerProfileSection = document.getElementById("customerProfile");
const customerProfileName = document.getElementById("customerProfileName");
const customerProfileEmail = document.getElementById("customerProfileEmail");
const customerProfileSince = document.getElementById("customerProfileSince");
const customerProfileMobile = document.getElementById("customerProfileMobile");
const customerProfileAddress = document.getElementById("customerProfileAddress");
const customerProfileToggle = document.getElementById("customerProfileToggle");
const profileMenu = document.getElementById("profileMenu");
const profileDropdown = document.getElementById("profileDropdown");
const dropdownOrders = document.getElementById("dropdownOrders");
const dropdownProfile = document.getElementById("dropdownProfile");
const dropdownLogout = document.getElementById("dropdownLogout");
// Keep the menu outside the horizontally scrollable mobile header so it cannot be clipped.
if (profileDropdown && profileDropdown.parentElement !== document.body) {
  document.body.appendChild(profileDropdown);
}
const navLinks = document.querySelectorAll(".main-nav a, .brand, .cta");
const profileEditBtn = document.getElementById("profileEditBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const customerProfileForm = document.getElementById("customerProfileForm");
const profileEmailInput = document.getElementById("profileEmailInput");
const profileMobileInput = document.getElementById("profileMobileInput");
const profileAddressInput = document.getElementById("profileAddressInput");
const customerProfileStatusEl = document.getElementById("customerProfileStatus");
let isCustomerProfileVisible = false;

function showLoginForm() {
  if (!customerLoginForm || !customerRegisterForm || !customerForgotForm || !customerResetForm || !customerUpdateForm) return;
  customerLoginForm.classList.remove("hidden");
  customerRegisterForm.classList.add("hidden");
  customerForgotForm.classList.add("hidden");
  customerResetForm.classList.add("hidden");
  customerUpdateForm.classList.add("hidden");
  customerLoginForm.querySelector("input")?.focus();
  if (customerForgotStatus) {
    customerForgotStatus.textContent = "";
  }
  if (customerUpdateStatus) {
    customerUpdateStatus.textContent = "";
  }
}

function showForgotForm() {
  if (!customerLoginForm || !customerRegisterForm || !customerForgotForm || !customerResetForm || !customerUpdateForm) return;
  customerLoginForm.classList.add("hidden");
  customerRegisterForm.classList.add("hidden");
  customerForgotForm.classList.remove("hidden");
  customerResetForm.classList.add("hidden");
  customerUpdateForm.classList.add("hidden");
  customerForgotEmailInput?.focus();
  if (customerForgotStatus) {
    customerForgotStatus.textContent = "";
  }
}

function showUpdatePasswordForm() {
  if (!customerLoginForm || !customerRegisterForm || !customerForgotForm || !customerResetForm || !customerUpdateForm) return;
  customerLoginForm.classList.add("hidden");
  customerRegisterForm.classList.add("hidden");
  customerForgotForm.classList.add("hidden");
  customerResetForm.classList.add("hidden");
  customerUpdateForm.classList.remove("hidden");
  customerNewPasswordInput?.focus();
  if (customerUpdateStatus) {
    customerUpdateStatus.textContent = "";
  }
}

function showResetPasswordForm() {
  if (!customerLoginForm || !customerRegisterForm || !customerForgotForm || !customerResetForm || !customerUpdateForm) return;
  customerLoginForm.classList.add("hidden");
  customerRegisterForm.classList.add("hidden");
  customerForgotForm.classList.add("hidden");
  customerUpdateForm.classList.add("hidden");
  customerResetForm.classList.remove("hidden");
  customerResetPasswordInput?.focus();
}

function toggleRegisterForm(show) {
  if (!customerLoginForm || !customerRegisterForm || !customerForgotForm) return;
  const shouldShow = typeof show === "boolean" ? show : customerRegisterForm.classList.contains("hidden");
  if (shouldShow) {
    customerRegisterForm.classList.remove("hidden");
    customerLoginForm.classList.add("hidden");
    customerForgotForm.classList.add("hidden");
    customerResetForm?.classList.add("hidden");
    customerUpdateForm?.classList.add("hidden");
    const firstField = document.getElementById("customerRegisterName");
    if (firstField) firstField.focus();
  } else {
    showLoginForm();
  }
}

showRegisterLink?.addEventListener("click", (e) => {
  e.preventDefault();
  toggleRegisterForm(true);
});

backToLoginLink?.addEventListener("click", (e) => {
  e.preventDefault();
  toggleRegisterForm(false);
});

forgotPasswordLink?.addEventListener("click", (event) => {
  event.preventDefault();
  showForgotForm();
});

backToLoginFromForgot?.addEventListener("click", (event) => {
  event.preventDefault();
  showLoginForm();
});

backToLoginFromReset?.addEventListener("click", (event) => {
  event.preventDefault();
  passwordResetToken = "";
  customerResetForm?.reset();
  showLoginForm();
});

// initial state
toggleRegisterForm(false);
if (passwordResetToken) {
  const resetURL = new URL(window.location.href);
  resetURL.searchParams.delete("reset_token");
  window.history.replaceState({}, "", `${resetURL.pathname}${resetURL.search}${resetURL.hash}`);
  openCustomerModal();
  showResetPasswordForm();
}

function firstNameFrom(name = "") {
  const trimmed = String(name).trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  return parts[0] || trimmed;
}

// Cart persistence helpers (per customer or guest)
const CART_KEY_PREFIX = "sv_cart_v1";
let pendingCartIds = null;
let cartHydrated = false;
let pendingCartMerge = [];

function cartStorageKey() {
  const email = state.customer?.email ? state.customer.email.trim().toLowerCase() : null;
  return email ? `${CART_KEY_PREFIX}_${email}` : `${CART_KEY_PREFIX}_guest`;
}

function readStoredCartIds() {
  try {
    const raw = localStorage.getItem(cartStorageKey());
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch (_) {
    return [];
  }
}

function saveCart() {
  if (!cartHydrated) return; // avoid wiping saved cart before we load it
  try {
    const ids = state.cart.map((item) => item.id);
    localStorage.setItem(cartStorageKey(), JSON.stringify(ids));
  } catch (_) {
    // ignore storage errors
  }
}

function loadCartFromStorage() {
  cartHydrated = false;
  pendingCartIds = readStoredCartIds();
  hydrateCartWithProducts();
}

function hydrateCartWithProducts() {
  if (!Array.isArray(pendingCartIds)) return;
  if (!products || !products.length) return; // wait until products loaded
  state.cart = pendingCartIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  mergePendingCart();
  cartHydrated = true;
  saveCart(); // ensure cleaned list persisted (drops missing products)
  renderCart();
}

function mergePendingCart() {
  if (!pendingCartMerge.length) return;
  pendingCartMerge.forEach(({ id, qty }) => {
    const existing = state.cart.find((item) => item.id === id);
    if (existing) {
      existing.qty = Math.max(Number(existing.qty || 1), Number(qty || 1));
      return;
    }
    const product = products.find((p) => p.id === id);
    if (product) {
      state.cart.push({ ...product, qty: Number(qty || 1) });
    }
  });
  pendingCartMerge = [];
}

function clearCartAndStorage() {
  const key = cartStorageKey();
  state.cart = [];
  pendingCartIds = [];
  cartHydrated = true;
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // ignore storage errors
  }
  renderCart();
}

function clearCartAfterOrder() {
  state.cart = [];
  saveCart();
  renderCart();
}

async function performLogout() {
  const keyBeforeLogout = cartStorageKey();
  await apiJSON("/api/customer/logout", { method: "POST", body: JSON.stringify({}) });
  try {
    localStorage.removeItem(keyBeforeLogout);
  } catch (_) {
    /* ignore */
  }
  clearCartAndStorage();
  clearCheckoutContact();
  state.customer = null;
  renderCustomerState();
}
const offerTitleText = document.getElementById("offerTitleText");
const offerDescText = document.getElementById("offerDescText");
const offerDiscountTitleText = document.getElementById("offerDiscountTitleText");
const offerDiscountDescText = document.getElementById("offerDiscountDescText");
const offerLessonsTitleText = document.getElementById("offerLessonsTitleText");
const offerLessonsDescText = document.getElementById("offerLessonsDescText");
const offersSection = document.querySelector(".offers-section");
const offerGrid = document.querySelector(".offer-grid");
const offerGridDynamic = document.getElementById("offerGridDynamic");
let offerOverrides = {};

function requireBackendPath(path) {
  if (!hasBackend) {
    throw new Error("Backend API unavailable. Open this site via http://localhost:8080");
  }
  return path;
}

function getCookieValue(name) {
  const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function getActiveDiscountPercent() {
  if (state.activeOfferType === "coupon") {
    return 0;
  }
  if (state.coupon?.applied) {
    return Math.min(90, Math.max(0, Number(state.coupon.percent) || 0));
  }
  if (state.activeOfferType === "discount") {
    return Math.min(90, Math.max(0, Number(offerOverrides.discountPercent) || 0));
  }
  if (state.activeOfferType === "lessons") {
    return 0;
  }
  return 0;
}

function getActiveDiscountLabel() {
  if (state.activeOfferType === "coupon" && state.coupon?.applied && state.coupon.code) {
    return `${state.coupon.code} coupon`;
  }
  if (state.activeOfferType === "discount") return offerOverrides.discountTitle || t("offerDiscountTitle");
  return "";
}

function setCouponStatus(message, isError = false, lock = false) {
  if (couponStatusEl) {
    couponStatusEl.textContent = message || "";
    couponStatusEl.classList.toggle("error", !!isError);
    if (lock) {
      couponStatusEl.dataset.lock = "1";
    } else {
      delete couponStatusEl.dataset.lock;
    }
  }
}

function syncCouponUIAvailability() {
  if (couponStatusEl && couponStatusEl.dataset.lock === "1") {
    return; // preserve last explicit message (e.g., duplicate use)
  }
  const hasConfig = !!(
    state.activeOfferType === "coupon" &&
    state.couponConfig?.enabled !== false &&
    state.couponConfig?.code &&
    state.couponConfig.percent > 0
  );
  if (couponCodeInput) {
    couponCodeInput.disabled = !hasConfig;
    couponCodeInput.placeholder = hasConfig ? t("couponPlaceholder") : "";
  }
  if (couponApplyBtn) {
    couponApplyBtn.disabled = !hasConfig;
  }
  if (!hasConfig) {
    state.coupon = { applied: false, code: null, percent: 0 };
    setCouponStatus(t("couponUnavailable"));
  } else if (!state.coupon.applied) {
    setCouponStatus(`${t("couponHint")} (${state.couponConfig.code} - ${state.couponConfig.percent}% off)`);
  }
}

function applyCoupon(codeInput) {
  // Keep grid populated even if apply flow fails mid-way
  ensureProductsVisible();
  const config = state.couponConfig;
  const code = (codeInput || "").trim().toUpperCase();
  if (!config?.enabled || !config.code || !config.percent) {
    setCouponStatus(t("couponUnavailable"), true, true);
    ensureProductsVisible();
    return;
  }
  if (code !== config.code.toUpperCase()) {
    state.coupon = { applied: false, code: null, percent: 0 };
    setCouponStatus(t("couponInvalid"), true, true);
    renderCart();
    ensureProductsVisible();
    return;
  }
  logCouponUsage(code)
    .then((result) => {
      if (!result.ok) {
        state.coupon = { applied: false, code: null, percent: 0 };
        setCouponStatus(result.message || t("couponInvalid"), true, true);
        renderCart();
        ensureProductsVisible();
        return;
      }
      state.coupon = { applied: true, code: config.code, percent: Number(config.percent) };
      setCouponStatus(`${t("couponApplied")} ${config.percent}% off`, false, false);
      ensureProductsVisible();
      renderCart();
    })
    .catch(() => {
      state.coupon = { applied: false, code: null, percent: 0 };
      setCouponStatus(t("couponInvalid"), true, true);
      renderCart();
      ensureProductsVisible();
    })
    .finally(() => {
      ensureProductsVisible();
    });
}

async function logCouponUsage(code) {
  if (!hasBackend || !code) return { ok: true };
  try {
    const resp = await fetch("/api/coupon/use", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email: state.customer?.email || "" })
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      return { ok: false, message: data.error || t("couponInvalid") };
    }
    return { ok: true };
  } catch (_) {
    return { ok: false, message: t("couponInvalid") };
  }
}

function t(key, fallback) {
  const activeGroup = translations[state.language] || translations.en;
  if (activeGroup && Object.prototype.hasOwnProperty.call(activeGroup, key)) {
    return activeGroup[key];
  }
  if (Object.prototype.hasOwnProperty.call(translations.en, key)) {
    return translations.en[key];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return key;
}

function applyLanguage(lang) {
  state.language = translations[lang] ? lang : "en";
  localStorage.setItem("svayavaniLang", state.language);
  document.documentElement.lang = state.language;
  const brandName = state.language === "en" ? "Swayamvani" : "स्वयंवाणी";
  if (brandText) {
    brandText.textContent = brandName;
  }
  if (brandLink) {
    brandLink.setAttribute("aria-label", `${brandName} Home`);
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (!element.dataset.i18nDefault) {
      element.dataset.i18nDefault = element.textContent;
    }
    element.textContent = t(key, element.dataset.i18nDefault);
  });
  if (langSwitcher) {
    langSwitcher.value = state.language;
  }

  renderProducts();
  renderCart();
  renderCustomerState();
  renderVideos();
  applyOfferOverrides();
  renderAllDeliveryInfo();
}

const DELIVERY_INFO_FIELDS = [
  ["deliveryShippingLabel", "shippingCharges"],
  ["deliveryLocationsLabel", "serviceableLocations"],
  ["deliveryDispatchLabel", "dispatchTime"],
  ["deliveryPackagingLabel", "packagingDetails"]
];

function renderDeliveryInfo(container, compact = false) {
  if (!container) return;
  container.replaceChildren();
  const list = document.createElement("dl");
  list.className = "delivery-info-list";
  DELIVERY_INFO_FIELDS.forEach(([labelKey, valueKey]) => {
    const text = String(deliveryInfo[valueKey] || "").trim();
    if (!text) return;
    const row = document.createElement("div");
    const label = document.createElement("dt");
    const value = document.createElement("dd");
    label.textContent = t(labelKey);
    value.textContent = text;
    row.append(label, value);
    list.appendChild(row);
  });
  if (!list.childElementCount) {
    container.hidden = true;
    return;
  }
  container.hidden = false;
  if (compact) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = t("deliveryTitle");
    details.append(summary, list);
    container.appendChild(details);
  } else {
    container.appendChild(list);
  }
}

function renderAllDeliveryInfo() {
  document.querySelectorAll("[data-delivery-info]").forEach((container) => {
    renderDeliveryInfo(container, container.dataset.deliveryInfo === "compact");
  });
}

async function loadDeliveryInfo() {
  if (!hasBackend) {
    renderAllDeliveryInfo();
    return;
  }
  try {
    const response = await fetch("/api/delivery", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Could not load delivery information");
    const data = await response.json();
    deliveryInfo = data.delivery || {};
  } catch (error) {
    deliveryInfo = {};
  }
  renderAllDeliveryInfo();
}

function normalizePrice(value) {
  const num = Number(String(value ?? 0).toString().replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(normalizePrice(value));
}

function getCartItemFinalPrice(item) {
  const basePrice = normalizePrice(item?.price);
  if (state.activeOfferType === "coupon") {
    return basePrice;
  }
  const pct = getActiveDiscountPercent();
  const price = Math.round(basePrice * (1 - pct / 100));
  return Math.max(0, price);
}

function getCartItemSavings(item) {
  if (state.activeOfferType === "coupon") return 0;
  const unitSavings = Math.max(0, (item?.price || 0) - getCartItemFinalPrice(item));
  const qty = Number(item?.qty || 1);
  return unitSavings * qty;
}

function resolveImage(product) {
  const name = String(product?.name || "").toLowerCase();
  const category = String(product?.category || "").toLowerCase();
  if (name.includes("sitar") || category === "string") return "assets/images/sitar.svg";
  if (name.includes("tabla") || name.includes("pakhawaj") || category === "percussion") return "assets/images/tabla.svg";
  if (name.includes("tanpura")) return "assets/images/tanpura.svg";
  if (name.includes("bansuri") || name.includes("flute") || category === "wind") return "assets/images/bansuri.svg";
  if (name.includes("harmonium") || category === "harmonium" || category === "keyboard") return "assets/images/harmonium.svg";
  return "assets/images/instruments-bg.svg";
}

function visibleProducts() {
  const filtered = products.filter((product) => {
    const category = String(product.category || "").trim().toLocaleLowerCase();
    if (state.filter !== "all" && category !== String(state.filter).toLocaleLowerCase()) return false;
    return true;
  });
  const availabilityOrder = { available: 0, made_to_order: 1, out_of_stock: 2 };
  if (state.catalogSort === "price-asc") filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (state.catalogSort === "price-desc") filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  if (state.catalogSort === "availability") filtered.sort((a, b) => (availabilityOrder[a.availability || "available"] ?? 3) - (availabilityOrder[b.availability || "available"] ?? 3));
  return filtered;
}

function categoryDisplayName(value) {
  return String(value || "Instrument")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderCatalogFilters() {
  if (!catalogFilters) return;
  const categories = [...new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))];
  if (state.filter !== "all" && !categories.includes(state.filter)) state.filter = "all";

  catalogFilters.replaceChildren();
  const options = [{ value: "all", label: t("filter_all") }, ...categories.map((value) => ({ value, label: categoryDisplayName(value) }))];
  options.forEach(({ value, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-btn${state.filter === value ? " active" : ""}`;
    button.dataset.filter = value;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(state.filter === value));
    catalogFilters.appendChild(button);
  });

  const harmoniumOnly = products.length > 0 && products.every(isHarmoniumProduct);
  productGrid?.classList.toggle("single-harmonium", harmoniumOnly && products.length === 1);
  productGrid?.classList.toggle("single-product", products.length === 1);
  if (catalogTitle) catalogTitle.textContent = t(harmoniumOnly ? "featuredInstruments" : "allProductTitle");
  if (catalogIntro) catalogIntro.textContent = t(harmoniumOnly ? "collectionIntro" : "allProductIntro");
  if (videosSectionTitle) videosSectionTitle.textContent = t(harmoniumOnly ? "videosTitle" : "allVideosTitle");
  if (videosSectionDesc) videosSectionDesc.textContent = t(harmoniumOnly ? "videosDesc" : "allVideosDesc");
}

function isHarmoniumProduct(product) {
  return /harmonium/i.test(product?.name || "") || String(product?.category || "").toLowerCase() === "harmonium";
}

function productGalleryMarkup(product, image) {
  const images = (product.images && product.images.length ? product.images : [image]).slice(0, 5);
  return `
    <div class="product-card-gallery">
      <img src="${image}" alt="${product.name}" class="product-image" data-gallery-main onerror="this.src='${resolveImage(product)}'" />
      <div class="product-thumbnails" role="group" aria-label="${product.name} photos">
        ${images.map((src, index) => `
          <button type="button" class="product-thumbnail ${index === 0 ? "is-active" : ""}" data-gallery-image="${src}" aria-pressed="${index === 0}" aria-label="View photo ${index + 1}">
            <img src="${src}" alt="" loading="lazy" />
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProducts() {
  if (!productGrid || !productsLoaded) return;
  productGrid.innerHTML = "";
  if (products.length === 0) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = t("catalogEmpty");
    productGrid.appendChild(empty);
    return;
  }
  const items = visibleProducts();
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = t("noProductMatches");
    productGrid.appendChild(empty);
    return;
  }
  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card${isHarmoniumProduct(product) ? " harmonium-product-card" : ""}`;
    card.setAttribute("data-product-id", String(product.id));
    card.dataset.availability = product.availability || "available";
    card.dataset.category = product.category || "Instrument";
    card.dataset.details = product.details || "";
    const image = product.images && product.images.length ? product.images[0] : resolveImage(product);
    const discountPct = getActiveDiscountPercent();
    const dealPrice = discountPct > 0 ? getCartItemFinalPrice(product) : product.price;
    const savings = discountPct > 0 ? product.price - dealPrice : 0;
    card.innerHTML = `
      ${productGalleryMarkup(product, image)}
      <h3>${product.name}</h3>
      <div class="product-specs">
        <strong>${t("productSpecsLabel")}</strong>
        <p class="product-details">${product.details || ""}</p>
      </div>
      <span class="availability-badge" data-store-availability="${product.availability || "available"}"></span>
      <div class="product-bottom">
        <div class="price-stack">
          <div class="price-row">
            <span class="price-label">${discountPct > 0 ? t("discountedPriceLabel") : "Price"}</span>
            <span class="price deal">${formatINR(dealPrice)}</span>
          </div>
          <div class="price-subrow">
            <span class="price-label muted">M.R.P:</span>
            <span class="price-original">${formatINR(product.price)}</span>
            ${discountPct > 0 ? `<span class="price-pct">(${discountPct}% off)</span>` : ""}
          </div>
          ${discountPct > 0 ? `<span class="price-savings">You save ${formatINR(savings)}</span>` : ""}
        </div>
        <div class="delivery-info-product" data-delivery-info="compact" hidden></div>
        <a class="shipping-link" href="https://wa.me/917020705968?text=${encodeURIComponent(`Hello, I have a question about delivery for ${product.name}.`)}" target="_blank" rel="noopener noreferrer">${t("shippingAsk")}</a>
        <button class="product-cta" data-id="${product.id}" ${product.availability === "out_of_stock" ? "disabled" : ""}><span>${product.availability === "out_of_stock" ? "Out of stock" : t("addToCart")}</span></button>
      </div>
    `;
    renderDeliveryInfo(card.querySelector("[data-delivery-info]"), true);
    productGrid.appendChild(card);
  });

  if (productGrid.children.length === 0) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = t("categoryEmpty");
    productGrid.appendChild(empty);
  }
}

function ensureProductsVisible() {
  renderProducts();
}


function openProductModal(product) {
  if (!productModal || !productModalTitle || !productMediaList) return;
  if (!productModal.hasAttribute("tabindex")) {
    productModal.tabIndex = -1;
  }
  if (productModal.__clearDescriptionTypewriter) {
    productModal.__clearDescriptionTypewriter();
  }
  productModalTitle.textContent = product.name;
  const discountPct = getActiveDiscountPercent();
  const dealPrice = discountPct > 0 ? getCartItemFinalPrice(product) : product.price;
  const savings = discountPct > 0 ? product.price - dealPrice : 0;
  const categoryLabel = isHarmoniumProduct(product) ? "Harmonium" : product.category;
  productModalMeta.innerHTML =
    discountPct > 0
      ? `${categoryLabel} | ${formatINR(dealPrice)} <span class="price-original">${formatINR(
          product.price
        )}</span> <span class="price-pct">(${discountPct}% off)</span>`
      : `${categoryLabel} | ${formatINR(product.price)}`;
  productMediaList.innerHTML = "";

  const images = (product.images && product.images.length ? product.images : [resolveImage(product)]).slice(0, 8);

  const wrapper = document.createElement("div");
  wrapper.className = "modal-product-grid";

  const gallery = document.createElement("div");
  gallery.className = "modal-gallery";

  const mainWrap = document.createElement("div");
  mainWrap.className = "modal-main";
  const mainImg = document.createElement("img");
  mainImg.alt = product.name;
  mainImg.loading = "lazy";
  mainImg.draggable = false;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;
  let zoomLevel = MIN_ZOOM;
  const resetZoom = () => {
    zoomLevel = MIN_ZOOM;
    mainImg.style.transform = `scale(${zoomLevel})`;
    mainImg.dataset.zoom = zoomLevel.toFixed(2);
  };
  const applyZoom = (value) => {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    mainImg.style.transform = `scale(${zoomLevel})`;
    mainImg.dataset.zoom = zoomLevel.toFixed(2);
  };
  const adjustZoom = (value) => applyZoom(value);

  const thumbButtons = [];
  let currentIndex = 0;
  const setImage = (targetIndex) => {
    const normalizedIndex = ((targetIndex % images.length) + images.length) % images.length;
    currentIndex = normalizedIndex;
    const nextSrc = images[normalizedIndex];
    mainImg.src = nextSrc;
    mainImg.alt = `${product.name} (${normalizedIndex + 1}/${images.length})`;
    thumbButtons.forEach((btn, idx) => btn.classList.toggle("active", idx === normalizedIndex));
    resetZoom();
  };
  const showNextImage = () => setImage(currentIndex + 1);
  const showPrevImage = () => setImage(currentIndex - 1);

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "modal-nav modal-nav-prev";
  prevBtn.setAttribute("aria-label", "Previous image");
  prevBtn.innerHTML = "‹";
  prevBtn.addEventListener("click", showPrevImage);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "modal-nav modal-nav-next";
  nextBtn.setAttribute("aria-label", "Next image");
  nextBtn.innerHTML = "›";
  nextBtn.addEventListener("click", showNextImage);

  const zoomControls = document.createElement("div");
  zoomControls.className = "modal-zoom-controls";
  const zoomInBtn = document.createElement("button");
  zoomInBtn.type = "button";
  zoomInBtn.className = "modal-zoom-btn";
  zoomInBtn.setAttribute("aria-label", "Zoom in");
  zoomInBtn.textContent = "+";
  zoomInBtn.addEventListener("click", () => adjustZoom(zoomLevel + ZOOM_STEP));
  const zoomOutBtn = document.createElement("button");
  zoomOutBtn.type = "button";
  zoomOutBtn.className = "modal-zoom-btn";
  zoomOutBtn.setAttribute("aria-label", "Zoom out");
  zoomOutBtn.textContent = "−";
  zoomOutBtn.addEventListener("click", () => adjustZoom(zoomLevel - ZOOM_STEP));
  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "modal-zoom-btn";
  resetBtn.setAttribute("aria-label", "Reset zoom");
  resetBtn.textContent = "⟲";
  resetBtn.addEventListener("click", resetZoom);
  zoomControls.append(zoomOutBtn, resetBtn, zoomInBtn);

  const makerOverlay = document.createElement("div");
  makerOverlay.className = "modal-maker-overlay";
  const makerBtn = document.createElement("button");
  makerBtn.type = "button";
  makerBtn.className = "modal-maker-cta";
  makerBtn.setAttribute("aria-label", t("watchMakingVideo"));
  makerBtn.innerHTML = `<span class="modal-maker-icon" aria-hidden="true">▶</span><span>${t(
    "watchMakingVideo"
  )}</span>`;
  makerBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (product.video_url) {
      window.open(product.video_url, "_blank");
    }
  });
  makerOverlay.appendChild(makerBtn);
  mainWrap.append(prevBtn, mainImg, nextBtn, zoomControls, makerOverlay);

  const thumbs = document.createElement("div");
  thumbs.className = "modal-thumbs";
  images.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-thumb";
    btn.innerHTML = `<img src="${src}" alt="${product.name} thumbnail ${idx + 1}" loading="lazy" />`;
    btn.addEventListener("click", () => setImage(idx));
    thumbButtons.push(btn);
    thumbs.appendChild(btn);
  });

  gallery.appendChild(mainWrap);
  gallery.appendChild(thumbs);

  const detailCol = document.createElement("div");
  detailCol.className = "modal-details";
  detailCol.innerHTML = `
    <p class="modal-price">${formatINR(dealPrice)} ${
      discountPct > 0 ? `<span class="price-original">${formatINR(product.price)}</span> <span class="price-pct">(${discountPct}% off)</span>` : ""
    }</p>
    ${savings > 0 ? `<p class="modal-savings">${t("youSavedLabel")} ${formatINR(savings)}</p>` : ""}
    <p class="modal-category">${product.category || ""}</p>
    <h3 class="modal-specs-title">${t("productSpecsLabel")}</h3>
    <p class="modal-desc"></p>
    <div class="delivery-info-product" data-delivery-info="compact" hidden></div>
    <a class="shipping-link" href="https://wa.me/917020705968?text=${encodeURIComponent(`Hello, I have a question about delivery for ${product.name}.`)}" target="_blank" rel="noopener noreferrer">${t("shippingAsk")}</a>
  `;
  renderDeliveryInfo(detailCol.querySelector("[data-delivery-info]"), true);
  const descElement = detailCol.querySelector(".modal-desc");
  let typewriterTimer = null;
  const stopTypewriter = () => {
    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  };
  const typeWriter = (element, text) => {
    stopTypewriter();
    if (!element) return;
    element.textContent = "";
    let index = 0;
    typewriterTimer = setInterval(() => {
      element.textContent += text[index] || "";
      index += 1;
      if (index >= text.length) {
        stopTypewriter();
      }
    }, 28);
  };
  typeWriter(descElement, product.details || "");

  wrapper.appendChild(gallery);
  wrapper.appendChild(detailCol);
  productMediaList.appendChild(wrapper);

  const SWIPE_THRESHOLD = 40;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let isPointerActive = false;
  mainWrap.addEventListener("pointerdown", (event) => {
    if (event.target !== mainImg) return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    isPointerActive = true;
    try {
      mainWrap.setPointerCapture(event.pointerId);
    } catch (err) {
      // ignore pointer capture errors
    }
  });
  const handlePointerEnd = (event) => {
    if (!isPointerActive) return;
    isPointerActive = false;
    if (event.pointerId) {
      try {
        mainWrap.releasePointerCapture(event.pointerId);
      } catch (err) {
        // swallow
      }
    }
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }
  };
  mainWrap.addEventListener("pointerup", handlePointerEnd);
  mainWrap.addEventListener("pointercancel", () => {
    isPointerActive = false;
  });
  mainWrap.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      adjustZoom(zoomLevel + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    },
    { passive: false }
  );
  mainWrap.addEventListener("dblclick", (event) => {
    if (event.target !== mainImg) return;
    resetZoom();
  });

  const handleSwipeClick = (event) => {
    if (event.target !== mainImg) return;
    if (event.clientX < mainImg.getBoundingClientRect().left + mainImg.clientWidth / 2) {
      showPrevImage();
    } else {
      showNextImage();
    }
  };
  mainWrap.addEventListener("click", handleSwipeClick);

  setImage(0);

  if (productModal) {
    if (productGalleryKeyHandler) {
      productModal.removeEventListener("keydown", productGalleryKeyHandler);
    }
    productGalleryKeyHandler = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextImage();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevImage();
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeProductDetailsModal();
      }
    };
    productModal.addEventListener("keydown", productGalleryKeyHandler);
    productModal.focus();
  }

  productModal.__clearDescriptionTypewriter = stopTypewriter;

  productModalAddToCart.dataset.productId = String(product.id);
  productModalAddToCart.innerHTML = `<span>${t("addToCart")}</span>`;
  productModalAddToCart.disabled = product.availability === "out_of_stock";
  if (productModalAddToCart.disabled) productModalAddToCart.innerHTML = "<span>Out of stock</span>";
  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
}


function closeProductDetailsModal() {
  if (!productModal) return;
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  productModal.blur();
  if (productGalleryKeyHandler) {
    productModal.removeEventListener("keydown", productGalleryKeyHandler);
    productGalleryKeyHandler = null;
  }
  if (productModal.__stop360Spin) {
    productModal.__stop360Spin();
    productModal.__stop360Spin = null;
  }
  if (productModal.__clearDescriptionTypewriter) {
    productModal.__clearDescriptionTypewriter();
    productModal.__clearDescriptionTypewriter = null;
  }
}

function renderCart() {
  cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p>${t("cartEmpty")}</p>`;
  } else {
    state.cart.forEach((item, index) => {
      const qty = Number(item.qty || 1);
      const row = document.createElement("div");
      row.className = "cart-item";
      const imageSrc = item.images && item.images.length ? item.images[0] : resolveImage(item);
      const description = item.details || item.description || "";

      const image = document.createElement("img");
      image.src = imageSrc;
      image.alt = item.name;
      image.onerror = () => {
        image.src = "assets/images/harmonium.svg";
      };

      const details = document.createElement("div");
      details.className = "cart-item-details";

      const title = document.createElement("strong");
      title.textContent = item.name;
      details.appendChild(title);

      if (description) {
        const descriptionEl = document.createElement("p");
        descriptionEl.className = "cart-item-description";
        descriptionEl.textContent = description;
        details.appendChild(descriptionEl);
      }

      const meta = document.createElement("div");
      meta.className = "cart-item-meta";

      const isCouponOffer = state.activeOfferType === "coupon";
      const discountedPrice = isCouponOffer ? item.price : getCartItemFinalPrice(item);
      const lineTotal = discountedPrice * qty;
      const savings = isCouponOffer ? 0 : getCartItemSavings(item);
      const discountPct = isCouponOffer ? 0 : item.price > 0 ? Math.round(((item.price - discountedPrice) / item.price) * 100) : 0;

      const priceWrap = document.createElement("div");
      priceWrap.className = "cart-item-price-wrap";

      const dealRow = document.createElement("div");
      dealRow.className = "cart-price-row";
      const dealLabel = document.createElement("span");
      dealLabel.className = "cart-item-price-label";
      dealLabel.textContent = t("discountedPriceLabel");
      const dealPrice = document.createElement("span");
      dealPrice.className = "cart-item-price";
      dealPrice.textContent = `${formatINR(lineTotal)}`;
      dealRow.appendChild(dealLabel);
      dealRow.appendChild(dealPrice);
      priceWrap.appendChild(dealRow);

      const mrpRow = document.createElement("div");
      mrpRow.className = "cart-price-subrow";
      const mrpLabel = document.createElement("span");
      mrpLabel.className = "cart-item-price-label muted";
      mrpLabel.textContent = "M.R.P:";
      const original = document.createElement("span");
      original.className = "cart-item-price-original";
      original.textContent = `${formatINR(item.price * qty)}`;
      mrpRow.appendChild(mrpLabel);
      mrpRow.appendChild(original);
      if (discountPct > 0) {
        const pct = document.createElement("span");
        pct.className = "cart-item-discount-pct";
        pct.textContent = `(${discountPct}% off)`;
        mrpRow.appendChild(pct);
      }
      priceWrap.appendChild(mrpRow);

      if (savings > 0) {
        const discountNote = document.createElement("span");
        discountNote.className = "cart-item-discount";
        discountNote.textContent = `You save ${formatINR(savings)}`;
        discountNote.title = t("offerDiscountDesc");
        priceWrap.appendChild(discountNote);
      }

      const controls = document.createElement("div");
      controls.className = "qty-controls";
      controls.innerHTML = `
        <button class=\"qty-btn\" type=\"button\" data-qty-dec=\"${index}\">-</button>
        <span class=\"qty-value\">${qty}</span>
        <button class=\"qty-btn\" type=\"button\" data-qty-inc=\"${index}\">+</button>
      `;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.dataset.remove = String(index);
      removeButton.textContent = t("remove");

      meta.appendChild(priceWrap);
      meta.appendChild(controls);
      meta.appendChild(removeButton);
      details.appendChild(meta);

      row.appendChild(image);
      row.appendChild(details);
      cartItems.appendChild(row);
    });
  }

  const mrpTotal = state.cart.reduce((sum, item) => sum + (item?.price || 0) * (item.qty || 1), 0);
  let subtotal = state.cart.reduce((sum, item) => sum + getCartItemFinalPrice(item) * (item.qty || 1), 0);
  let total = subtotal;
  if (state.activeOfferType === "coupon" && state.coupon?.applied && state.coupon.percent > 0) {
    const pct = Math.min(90, Math.max(0, Number(state.coupon.percent) || 0));
    total = Math.round(mrpTotal * (1 - pct / 100));
    subtotal = mrpTotal;
  }
  const itemsCount = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  cartTotal.textContent = formatINR(total);
  cartCount.textContent = state.cart.length;
  const itemsCountEl = document.getElementById("cartItemsCount");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartTotalSavingsEl = document.getElementById("cartTotalSavings");
  if (itemsCountEl) itemsCountEl.textContent = itemsCount;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatINR(mrpTotal);
  if (cartTotalSavingsEl) cartTotalSavingsEl.textContent = formatINR(Math.max(0, mrpTotal - total));
  saveCart();
  if (cartSavingsEl) {
    const totalSavings =
      state.activeOfferType === "coupon" && state.coupon?.applied
        ? Math.max(0, mrpTotal - total)
        : state.cart.reduce((sum, item) => sum + getCartItemSavings(item), 0);
    if (totalSavings > 0) {
      const discountLabel = getActiveDiscountLabel();
      cartSavingsEl.style.display = "inline-flex";
      cartSavingsEl.innerHTML = `
        <span class="cart-savings-label">${discountLabel ? `${discountLabel} applied` : t("offerDiscountTitle")}</span>
        <span class="cart-savings-dot">•</span>
        <span class="cart-savings-amount">${t("youSavedLabel")} ${formatINR(totalSavings)}</span>
        <span class="cart-savings-dot">•</span>
        <span class="cart-savings-note">M.R.P ${formatINR(mrpTotal)}</span>
      `;
    } else {
      cartSavingsEl.style.display = "none";
      cartSavingsEl.textContent = "";
    }
  }

  if (cartDiscountHintEl) {
    const showDiscountHint = state.activeOfferType === "discount" && !state.customer && state.cart.length > 0;
    cartDiscountHintEl.textContent = showDiscountHint ? t("cartDiscountGuestHint") : "";
    cartDiscountHintEl.style.display = showDiscountHint ? "block" : "none";
  }

  syncCouponUIAvailability();
  if (state.coupon.applied && state.coupon.code) {
    setCouponStatus(`${t("couponApplied")} ${state.coupon.code} (${state.coupon.percent}% off)`);
  }
}

function applyOfferOverrides(overrides = null) {
  if (overrides) {
    offerOverrides = { ...offerOverrides, ...overrides };
  }
  const resolved = {
    offerType: offerOverrides.offerType || state.activeOfferType || null,
    title: offerOverrides.title || t("offerTitle"),
    desc: offerOverrides.desc || t("offerDesc"),
    discountTitle: offerOverrides.discountTitle || t("offerDiscountTitle"),
    discountDesc: offerOverrides.discountDesc || t("offerDiscountDesc"),
    discountPercent: Number(offerOverrides.discountPercent ?? 10),
    lessonsTitle: offerOverrides.lessonsTitle || t("offerLessonsTitle"),
    lessonsDesc: offerOverrides.lessonsDesc || t("offerLessonsDesc"),
    couponCode: offerOverrides.couponCode || "",
    couponPercent: Number(offerOverrides.couponPercent || 0),
    couponEnabled: offerOverrides.couponEnabled !== false
  };
  state.activeOfferType = resolved.offerType || null;
  const isCouponType = resolved.offerType === "coupon";
  const couponCode = (resolved.couponCode || "").trim();
  const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&");
  const stripCode = (text, fallback) => {
    if (!text) return fallback;
    if (!isCouponType || !couponCode) return text;
    const cleaned = text.replace(new RegExp(escapeRegex(couponCode), "gi"), "").trim();
    return cleaned || fallback;
  };
  const displayTitle = stripCode(resolved.title, t("offerTitle"));
  const displayDesc = stripCode(resolved.desc, t("offerDesc"));
  const displayDiscountTitle = stripCode(resolved.discountTitle, t("offerDiscountTitle"));
  const displayDiscountDesc = stripCode(resolved.discountDesc, t("offerDiscountDesc"));
  const displayLessonsTitle = stripCode(resolved.lessonsTitle, t("offerLessonsTitle"));
  const displayLessonsDesc = stripCode(resolved.lessonsDesc, t("offerLessonsDesc"));

  if (offerTitleText) offerTitleText.textContent = displayTitle;
  if (offerDescText) offerDescText.textContent = displayDesc;
  if (offerDiscountTitleText) offerDiscountTitleText.textContent = displayDiscountTitle;
  if (offerDiscountDescText) offerDiscountDescText.textContent = displayDiscountDesc;
  if (offerLessonsTitleText) offerLessonsTitleText.textContent = displayLessonsTitle;
  if (offerLessonsDescText) offerLessonsDescText.textContent = displayLessonsDesc;
  if (!resolved.offerType && offerGridDynamic) {
    offerGridDynamic.innerHTML = "";
  }
  if (offerGridDynamic) {
    offerGridDynamic.innerHTML = "";
    if (!resolved.offerType) {
      return;
    }
    const iconText =
      resolved.offerType === "lessons"
        ? "4"
        : resolved.offerType === "coupon" && resolved.couponPercent
        ? `${resolved.couponPercent}%`
        : resolved.offerType === "coupon"
        ? resolved.couponCode || "★"
        : (resolved.discountTitle || resolved.title || "★").split(" ")[0] || "★";
    const titleText =
      resolved.offerType === "lessons"
        ? displayLessonsTitle || displayTitle
        : resolved.offerType === "coupon"
        ? displayDiscountTitle || displayTitle
        : displayDiscountTitle || displayTitle;
    const descText =
      resolved.offerType === "lessons"
        ? displayLessonsDesc || displayDesc
        : resolved.offerType === "coupon"
        ? displayDiscountDesc || displayDesc
        : displayDiscountDesc || displayDesc;
    const card = document.createElement("article");
    card.className = "offer-card";
    card.innerHTML = `<div class=\"offer-icon\" aria-hidden=\"true\">${iconText}</div><div><h3>${titleText}</h3><p>${descText}</p></div>`;
    offerGridDynamic.appendChild(card);
  }
  state.couponConfig = { code: resolved.couponCode, percent: resolved.couponPercent, enabled: resolved.couponEnabled };
  if (!state.coupon.applied) {
    state.coupon = { applied: false, code: null, percent: 0 };
  }
  syncCouponUIAvailability();
  renderProducts();
  renderCart();
  updateOfferVisibility();
}

async function loadOffers() {
  if (!hasBackend) {
    state.activeOfferType = null;
    if (offerGridDynamic) offerGridDynamic.innerHTML = "";
    renderProducts();
    renderCart();
    updateOfferVisibility();
    return;
  }
  try {
    const response = await fetch("/api/offers", { credentials: "same-origin" });
    const data = await response.json();
    const config = data.offers || {};
    if (!config.offerType) {
      state.activeOfferType = null;
      if (offerGridDynamic) offerGridDynamic.innerHTML = "";
      renderProducts();
      renderCart();
      updateOfferVisibility();
      return;
    }
    applyOfferOverrides({
      offerType: config.offerType,
      title: config.title,
      desc: config.desc,
      discountTitle: config.discountTitle,
      discountDesc: config.discountDesc,
      discountPercent: config.discountPercent,
      lessonsTitle: config.lessonsTitle,
      lessonsDesc: config.lessonsDesc,
      couponCode: config.couponCode,
      couponPercent: config.couponPercent,
      couponEnabled: config.couponEnabled
    });
  } catch (error) {
    console.warn("Failed to load offers", error);
    state.activeOfferType = null;
    if (offerGridDynamic) offerGridDynamic.innerHTML = "";
    renderProducts();
    renderCart();
    updateOfferVisibility();
  }
}

async function loadVideos() {
  try {
    const response = await fetch(requireBackendPath("/api/videos"));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t("videoLoadFailed"));
    }
    state.videos = data.videos || [];
    renderVideos();
  } catch (error) {
    state.videos = [...defaultVideos];
    renderVideos();
  }
}

function videoTitleText(video) {
  if (video.titleKey) return t(video.titleKey);
  return video.title || "Video";
}

function renderVideos() {
  if (!videoGrid) return;
  videoGrid.innerHTML = "";

  if (!state.videos.length) {
    videoGrid.innerHTML = `<p>${t("videosEmpty")}</p>`;
    return;
  }

  state.videos.forEach((video) => {
    const card = document.createElement("article");
    card.className = "video-card";
    const title = videoTitleText(video);
    card.innerHTML = `
      <video controls preload="metadata" playsinline>
        <source src="${video.url}" type="video/mp4" />
      </video>
      <div class="video-card-head">
        <p>${title}</p>
      </div>
    `;
    videoGrid.appendChild(card);
  });
}

function closeCartPanel() {
  if (cartPanel.contains(document.activeElement)) {
    cartBtn?.focus();
  }
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
}

function openCartPanel() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
}
window.openOrderProductInCollection = function (orderItem = {}) {
  if (!productsLoaded) {
    return { ok: false, message: "The product list is still loading. Please try again." };
  }
  const productId = Number(orderItem.product_id) || 0;
  const orderImage = String(orderItem.image || "");
  const orderName = String(orderItem.name || "").trim().toLocaleLowerCase();
  const product =
    products.find((candidate) => productId > 0 && Number(candidate.id) === productId) ||
    products.find((candidate) => orderImage && (candidate.images || []).includes(orderImage)) ||
    products.find((candidate) => String(candidate.name || "").trim().toLocaleLowerCase() === orderName);
  if (!product) {
    return { ok: false, message: "This product is no longer listed in the Swayamvani Collection." };
  }

  state.filter = "all";
  state.catalogSort = "default";
  if (catalogSort) catalogSort.value = "default";
  renderCatalogFilters();
  renderProducts();

  const collection = document.getElementById("products");
  const productCard = [...(productGrid?.children || [])].find(
    (card) => Number(card.dataset.productId) === Number(product.id)
  );
  requestAnimationFrame(() => {
    (productCard || collection)?.scrollIntoView({ behavior: "smooth", block: productCard ? "center" : "start" });
    window.setTimeout(() => openProductModal(product), 300);
  });
  return { ok: true, productName: product.name };
};

if (cartPanel) {
  cartPanel.addEventListener("click", (event) => {
    if (event.target === cartPanel) {
      closeCartPanel();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!cartPanel?.classList.contains("open") || !cartPanel) return;
  if (cartPanel.contains(event.target)) return;
  if (cartBtn && cartBtn.contains(event.target)) return;
  closeCartPanel();
});

function openCustomerModal() {
  closeCartPanel();
  customerModal?.classList.add("open");
  customerModal?.setAttribute("aria-hidden", "false");
}

function closeCustomerAuthModal() {
  customerModal?.classList.remove("open");
  customerModal?.setAttribute("aria-hidden", "true");
  if (customerLoginStatus) customerLoginStatus.textContent = "";
  if (customerRegisterStatus) customerRegisterStatus.textContent = "";
}

function showProfileModal() {
  if (!profileModal || !state.customer) return;
  if (profileEmailInput) {
    profileEmailInput.value = state.customer.email || "";
    profileEmailInput.focus();
  }
  if (profileMobileInput) {
    profileMobileInput.value = state.customer.mobile || "";
  }
  if (profileAddressInput) {
    profileAddressInput.value = state.customer.address || "";
  }
  if (customerProfileStatusEl) {
    customerProfileStatusEl.textContent = "";
  }
  profileModal.classList.add("open");
  profileModal.setAttribute("aria-hidden", "false");
}

function hideProfileModal() {
  if (!profileModal) return;
  profileModal.classList.remove("open");
  profileModal.setAttribute("aria-hidden", "true");
  if (customerProfileStatusEl) {
    customerProfileStatusEl.textContent = "";
  }
}

function renderCustomerState() {
  if (customerAuthBtn) {
    if (state.customer) {
      customerAuthBtn.setAttribute("hidden", "true");
      if (customerGreeting) {
        const firstName = firstNameFrom(state.customer.name || "");
        customerGreeting.textContent = firstName ? `Hi, ${firstName}` : "";
      }
    } else {
      customerAuthBtn.removeAttribute("hidden");
      customerAuthBtn.textContent = t("customerLogin");
      if (customerGreeting) customerGreeting.textContent = "";
    }
  }
  renderCustomerProfile();
  loadCartFromStorage();
  renderCart();
  renderProducts();
  updateOfferVisibility();
  notifyCustomerState();
}

function renderCustomerProfile() {
  if (!state.customer) closeProfileDropdown();
  if (customerProfileToggle) {
    customerProfileToggle.hidden = !state.customer;
    customerProfileToggle.setAttribute("aria-expanded", String(!!state.customer && isCustomerProfileVisible));
  }
  if (profileMenu) {
    profileMenu.hidden = !state.customer;
  }
  if (!customerProfileSection) return;
  if (!state.customer) {
    isCustomerProfileVisible = false;
  }
  if (!state.customer || !isCustomerProfileVisible) {
    customerProfileSection.hidden = true;
    return;
  }
  const { name, email, created_at: createdAt, mobile, address } = state.customer;
  customerProfileName.textContent = name || "";
  customerProfileEmail.textContent = email || "";
  const missingValue = t("profileMissingValue");
  if (customerProfileMobile) {
    customerProfileMobile.textContent = mobile || missingValue;
  }
  if (customerProfileAddress) {
    customerProfileAddress.textContent = address || missingValue;
  }
  if (customerProfileSince) {
    if (createdAt) {
      const date = new Date(createdAt);
      if (!Number.isNaN(date.valueOf())) {
        customerProfileSince.textContent = formatINRDate(date);
      } else {
        customerProfileSince.textContent = createdAt;
      }
    } else {
      customerProfileSince.textContent = "";
    }
  }
  customerProfileSection.hidden = false;
}

function formatINRDate(date) {
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

async function apiJSON(path, options = {}) {
  const response = await fetch(requireBackendPath(path), {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || t("customerAuthFailed"));
  }
  return data;
}

async function checkCustomerSession() {
  try {
    const data = await apiJSON("/api/customer/me", { method: "GET" });
    state.customer = data.customer || null;
  } catch {
    state.customer = null;
  }
  renderCustomerState();
  renderProducts();
  renderCart();
  applyStoredShipping(state.customer);
}

function togglePasswordById(targetId, button) {
  const input = document.getElementById(targetId);
  if (!input) return;
  const shouldShow = input.type === "password";
  input.type = shouldShow ? "text" : "password";
  if (button) {
    button.classList.toggle("is-visible", shouldShow);
    button.setAttribute("aria-pressed", String(shouldShow));
    button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  }
}

function updateOfferVisibility() {
  if (!offersSection) return;
  const hasActive = !!state.activeOfferType;
  offersSection.hidden = !hasActive;
  offersSection.style.display = hasActive ? "block" : "none";
  if (offerGrid) {
    offerGrid.style.display = hasActive ? "grid" : "none";
  }
  if (offerGridDynamic) {
    offerGridDynamic.style.display = hasActive ? "grid" : "none";
  }
}
window.togglePasswordById = togglePasswordById;

function initPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.dataset.bound = "1";
    const targetId = button.getAttribute("data-target");
    if (!targetId) return;
    const input = document.getElementById(targetId);
    if (!input) return;

    button.addEventListener("click", () => {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.classList.toggle("is-visible", shouldShow);
      button.setAttribute("aria-pressed", String(shouldShow));
      button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    });
  });
}

document.addEventListener("click", async (event) => {
  const toggleBtn = event.target.closest(".password-toggle");
  if (toggleBtn) {
    const targetId = toggleBtn.getAttribute("data-target");
    const input = targetId ? document.getElementById(targetId) : null;
    if (input) {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      toggleBtn.classList.toggle("is-visible", shouldShow);
      toggleBtn.setAttribute("aria-pressed", String(shouldShow));
      toggleBtn.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    }
    return;
  }

  if (event.target.closest("#closeCart, #closeCartFooter")) {
    closeCartPanel();
    return;
  }

  const id = event.target.getAttribute("data-id");
  if (id) {
    const selected = products.find((p) => p.id === Number(id));
    if (selected) {
      if (selected.availability === "out_of_stock") return;
      const existing = state.cart.find((item) => item.id === selected.id);
      if (existing) {
        existing.qty = Math.min(99, Number(existing.qty || 1) + 1);
      } else {
        state.cart.push({ ...selected, qty: 1 });
      }
      renderCart();
    }
    return;
  }

  const card = event.target.closest(".product-card");
  if (card) {
    const productId = Number(card.getAttribute("data-product-id"));
    const selected = products.find((p) => p.id === productId);
    if (selected) {
      openProductModal(selected);
    }
    return;
  }

  const removeIndex = event.target.getAttribute("data-remove");
  if (removeIndex !== null) {
    state.cart.splice(Number(removeIndex), 1);
    renderCart();
  }

  const incIndex = event.target.getAttribute("data-qty-inc");
  if (incIndex !== null) {
    const idx = Number(incIndex);
    if (state.cart[idx]) {
      state.cart[idx].qty = Math.min(99, Number(state.cart[idx].qty || 1) + 1);
      renderCart();
    }
    return;
  }

  const decIndex = event.target.getAttribute("data-qty-dec");
  if (decIndex !== null) {
    const idx = Number(decIndex);
    if (state.cart[idx]) {
      state.cart[idx].qty = Math.max(1, Number(state.cart[idx].qty || 1) - 1);
      renderCart();
    }
    return;
  }

});

customerProfileToggle?.addEventListener("click", () => {
  if (!state.customer) return;
  isCustomerProfileVisible = !isCustomerProfileVisible;
  renderCustomerProfile();
});

profileEditBtn?.addEventListener("click", () => {
  if (!state.customer) return;
  showProfileModal();
});

closeProfileModal?.addEventListener("click", () => {
  hideProfileModal();
});

profileModal?.addEventListener("click", (event) => {
  if (event.target === profileModal) {
    hideProfileModal();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
    // Close cart when navigating via menu/brand/CTA
    if (cartPanel.classList.contains("open")) {
      closeCartPanel();
    }
  });
});

// Fallback: close cart on any header/menu/CTA click (event delegation)
document.addEventListener("click", (event) => {
  const navClick = event.target.closest(".main-nav a, .brand, .cta");
  if (navClick && cartPanel.classList.contains("open")) {
    closeCartPanel();
  }
});

cartBtn.addEventListener("click", () => {
  openCartPanel();
});

closeCart?.addEventListener("click", closeCartPanel);
closeCartFooter?.addEventListener("click", closeCartPanel);
closeProductModal?.addEventListener("click", closeProductDetailsModal);
productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) closeProductDetailsModal();
});
couponApplyBtn?.addEventListener("click", () => applyCoupon(couponCodeInput?.value || ""));
couponCodeInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCoupon(couponCodeInput.value);
  }
});
couponCodeInput?.addEventListener("input", () => {
  setCouponStatus("", false, false);
});
productModalAddToCart?.addEventListener("click", () => {
  const id = Number(productModalAddToCart.dataset.productId || "0");
  const selected = products.find((p) => p.id === id);
  if (selected) {
    if (selected.availability === "out_of_stock") return;
    const existing = state.cart.find((item) => item.id === selected.id);
    if (existing) {
      existing.qty = Math.min(99, Number(existing.qty || 1) + 1);
    } else {
      state.cart.push({ ...selected, qty: 1 });
    }
    renderCart();
    closeProductDetailsModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProductDetailsModal();
});

if (langSwitcher) {
  langSwitcher.addEventListener("change", () => {
    applyLanguage(langSwitcher.value);
    renderCatalogFilters();
  });
}

customerAuthBtn?.addEventListener("click", async () => {
  if (state.customer) {
    try {
      await performLogout();
    } catch (error) {
      alert(error.message || t("customerAuthFailed"));
    }
    return;
  }
  openCustomerModal();
});

closeCustomerModal?.addEventListener("click", closeCustomerAuthModal);
customerModal?.addEventListener("click", (event) => {
  // Close when clicking anywhere outside the modal card
  if (!event.target.closest(".customer-modal-card")) closeCustomerAuthModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && customerModal?.classList.contains("open")) {
    closeCustomerAuthModal();
  }
});

// Profile dropdown (hover + click)
let profileDropdownTimeout = null;
function openProfileDropdown() {
  if (!profileMenu || !profileDropdown) return;
  const triggerRect = customerProfileToggle?.getBoundingClientRect();
  profileDropdown.classList.add("open");
  if (triggerRect) {
    const menuWidth = profileDropdown.offsetWidth;
    const left = Math.min(Math.max(8, triggerRect.left), window.innerWidth - menuWidth - 8);
    let top = triggerRect.bottom + 8;
    if (top + profileDropdown.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, triggerRect.top - profileDropdown.offsetHeight - 8);
    }
    profileDropdown.style.setProperty("--profile-dropdown-top", `${top}px`);
    profileDropdown.style.setProperty("--profile-dropdown-left", `${left}px`);
  }
  profileMenu.classList.add("open");
  profileDropdown.setAttribute("aria-hidden", "false");
  customerProfileToggle?.setAttribute("aria-expanded", "true");
}
function closeProfileDropdown() {
  if (!profileMenu || !profileDropdown) return;
  profileMenu.classList.remove("open");
  profileDropdown.classList.remove("open");
  profileDropdown.setAttribute("aria-hidden", "true");
  if (profileDropdown.contains(document.activeElement)) {
    customerProfileToggle?.focus();
  }
  customerProfileToggle?.setAttribute("aria-expanded", "false");
}
const profileSupportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (profileSupportsHover) {
  profileMenu?.addEventListener("mouseenter", () => {
    if (profileDropdownTimeout) clearTimeout(profileDropdownTimeout);
    openProfileDropdown();
  });
  profileMenu?.addEventListener("mouseleave", () => {
    profileDropdownTimeout = setTimeout(closeProfileDropdown, 120);
  });
  profileDropdown?.addEventListener("mouseenter", () => {
    if (profileDropdownTimeout) clearTimeout(profileDropdownTimeout);
  });
  profileDropdown?.addEventListener("mouseleave", () => {
    profileDropdownTimeout = setTimeout(closeProfileDropdown, 120);
  });
}
customerProfileToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (profileMenu.classList.contains("open")) {
    closeProfileDropdown();
  } else {
    openProfileDropdown();
  }
});
document.addEventListener("click", (e) => {
  if (!profileMenu) return;
  if (!profileMenu.contains(e.target) && !profileDropdown?.contains(e.target)) {
    closeProfileDropdown();
  }
});
window.addEventListener("resize", () => {
  if (profileMenu?.classList.contains("open")) openProfileDropdown();
});
window.addEventListener("scroll", () => {
  if (profileMenu?.classList.contains("open")) closeProfileDropdown();
}, { passive: true });

dropdownOrders?.addEventListener("click", () => {
  closeProfileDropdown();
  if (typeof openOrdersModal === "function") openOrdersModal();
});

dropdownProfile?.addEventListener("click", () => {
  closeProfileDropdown();
  if (!state.customer) return;
  isCustomerProfileVisible = true;
  renderCustomerProfile();
  requestAnimationFrame(() => {
    customerProfileSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

dropdownLogout?.addEventListener("click", async () => {
  closeProfileDropdown();
  if (!state.customer) return;
  try {
    await performLogout();
  } catch (error) {
    alert(error.message || t("customerAuthFailed"));
  }
});

customerLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (customerLoginStatus) customerLoginStatus.textContent = t("sending");

  const guestCartSnapshot = Object.entries(
    state.cart.reduce((acc, item) => {
      const qty = Number(item.qty || 1);
      acc[item.id] = Math.max(acc[item.id] || 0, qty);
      return acc;
    }, {})
  ).map(([id, qty]) => ({ id: Number(id), qty }));

  try {
    const data = await apiJSON("/api/customer/login", {
      method: "POST",
      body: JSON.stringify({
        email: customerLoginEmailInput?.value || "",
        password: customerLoginPasswordInput?.value || ""
      })
    });

    state.customer = data.customer || null;
    if (guestCartSnapshot.length) {
      pendingCartMerge = guestCartSnapshot;
    }
    applyStoredShipping(state.customer);
    renderCustomerState();
    customerLoginForm.reset();
    closeCustomerAuthModal();
  } catch (error) {
    if (customerLoginStatus) customerLoginStatus.textContent = error.message || t("customerAuthFailed");
  }
});

customerRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (customerRegisterStatus) customerRegisterStatus.textContent = t("sending");

  try {
    const rawName = document.getElementById("customerRegisterName").value.trim();
    const nameVal = rawName.replace(/\s+/g, " ");
    if (!nameVal || nameVal.length > 20 || !nameVal.includes(" ")) {
      throw new Error("Enter first and last name (max 20 characters).");
    }
    await apiJSON("/api/customer/register", {
      method: "POST",
      body: JSON.stringify({
        name: nameVal,
        email: document.getElementById("customerRegisterEmail").value,
        password: document.getElementById("customerRegisterPassword").value
      })
    });

    const successMessage = t("customerRegisterSuccess");
    if (customerLoginStatus) customerLoginStatus.textContent = successMessage;
    toggleRegisterForm(false);
    if (customerRegisterStatus) customerRegisterStatus.textContent = "";
    customerRegisterForm.reset();
  } catch (error) {
    if (customerRegisterStatus) customerRegisterStatus.textContent = error.message || t("customerAuthFailed");
  }
});

customerForgotForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!customerForgotStatus) return;
  customerForgotStatus.textContent = t("sending");

  const email = (customerForgotEmailInput?.value || "").trim().toLowerCase();
  if (!email) {
    customerForgotStatus.textContent = t("customerForgotPasswordError");
    return;
  }

  try {
    await apiJSON("/api/customer/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    customerForgotStatus.textContent = t("customerForgotPasswordSent");
    customerForgotForm.reset();
  } catch (error) {
    customerForgotStatus.textContent = error.message || t("customerForgotPasswordError");
  }
});

customerResetForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!customerResetStatus) return;
  const newPassword = (customerResetPasswordInput?.value || "").trim();
  const confirmPassword = (customerResetConfirmPasswordInput?.value || "").trim();
  if (newPassword.length < 6 || newPassword !== confirmPassword) {
    customerResetStatus.textContent = t("customerUpdatePasswordError");
    return;
  }
  if (!passwordResetToken) {
    customerResetStatus.textContent = t("customerResetInvalid");
    return;
  }
  customerResetStatus.textContent = t("sending");
  try {
    await apiJSON("/api/customer/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: passwordResetToken, password: newPassword })
    });
    passwordResetToken = "";
    customerResetForm.reset();
    customerResetStatus.textContent = t("customerResetSuccess");
    showLoginForm();
    if (customerLoginStatus) customerLoginStatus.textContent = t("customerResetSuccess");
  } catch (error) {
    customerResetStatus.textContent = error.message || t("customerResetInvalid");
  }
});

customerUpdateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!customerUpdateStatus) return;
  const newPassword = (customerNewPasswordInput?.value || "").trim();
  const confirmPassword = (customerConfirmPasswordInput?.value || "").trim();
  if (newPassword.length < 6) {
    customerUpdateStatus.textContent = t("customerUpdatePasswordError");
    return;
  }
  if (newPassword !== confirmPassword) {
    customerUpdateStatus.textContent = t("customerUpdatePasswordError");
    return;
  }
  customerUpdateStatus.textContent = t("sending");

  try {
    await apiJSON("/api/customer/update-password", {
      method: "POST",
      body: JSON.stringify({ password: newPassword })
    });
    customerUpdateStatus.textContent = t("customerUpdatePasswordSuccess");
    if (customerNewPasswordInput) customerNewPasswordInput.value = "";
    if (customerConfirmPasswordInput) customerConfirmPasswordInput.value = "";
    await performLogout();
    showLoginForm();
  } catch (error) {
    customerUpdateStatus.textContent = error.message || t("customerUpdatePasswordError");
  }
});

customerProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!customerProfileStatusEl) return;
  customerProfileStatusEl.textContent = t("sending");
  const payload = {
    email: (profileEmailInput?.value || "").trim().toLowerCase(),
    mobile: (profileMobileInput?.value || "").trim(),
    address: (profileAddressInput?.value || "").trim()
  };
  try {
    const data = await apiJSON("/api/customer/profile", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.customer = data.customer || state.customer;
    renderCustomerState();
    customerProfileStatusEl.textContent = t("profileUpdateSuccess");
    setTimeout(() => {
      customerProfileStatusEl.textContent = "";
      hideProfileModal();
    }, 900);
  } catch (error) {
    customerProfileStatusEl.textContent = error.message || t("profileUpdateError");
  }
});

function applyStoredShipping(customer) {
  if (!customer) return;
  const mobileField = document.getElementById("checkoutMobile");
  const addressField = document.getElementById("checkoutAddress");
  if (customer.mobile && mobileField && !mobileField.value) {
    mobileField.value = customer.mobile;
  }
  if (customer.address && addressField && !addressField.value) {
    addressField.value = customer.address;
  }
}

function clearCheckoutContact() {
  const mobileField = document.getElementById("checkoutMobile");
  const addressField = document.getElementById("checkoutAddress");
  if (mobileField) mobileField.value = "";
  if (addressField) addressField.value = "";
}

function clearCheckoutContact() {
  const mobileField = document.getElementById("checkoutMobile");
  const addressField = document.getElementById("checkoutAddress");
  if (mobileField) mobileField.value = "";
  if (addressField) addressField.value = "";
}

async function tryRazorpayCheckout() {
  const response = await fetch(requireBackendPath("/api/payment/razorpay/order"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: state.cart.map((item) => ({ product_id: Number(item.id), quantity: Number(item.qty || 1) })),
      coupon_code: state.coupon?.applied ? state.coupon.code : ""
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || t("checkoutUnavailable"));
  }
  if (!window.Razorpay) {
    throw new Error(t("checkoutUnavailable"));
  }

  const options = {
    key: data.key_id,
    amount: data.amount,
    currency: data.currency || "INR",
    name: "स्वयंवाणी Instruments",
    description: "Indian Classical Instrument Order",
    order_id: data.order_id,
    handler: function () {
      alert(t("paymentSuccess"));
      clearCartAfterOrder();
      if (window.onOrderCreated) window.onOrderCreated();
    },
    theme: { color: "#8e3b2f" }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

async function fallbackWhatsAppCheckout() {
  const mobile = (document.getElementById("checkoutMobile")?.value || "").trim();
  const address = (document.getElementById("checkoutAddress")?.value || "").trim();
  if (!mobile || mobile.replace(/\\D/g, "").length !== 10) {
    const shipStatus = document.getElementById("shipStatus");
    if (shipStatus) shipStatus.textContent = "Enter a 10-digit mobile number.";
    throw new Error("Invalid mobile number");
  }
  if (!address || address.length < 8) {
    const shipStatus = document.getElementById("shipStatus");
    if (shipStatus) shipStatus.textContent = "Enter your shipping address.";
    throw new Error("Invalid address");
  }

  const response = await fetch(requireBackendPath("/api/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: state.cart.map((item) => ({ product_id: Number(item.id), quantity: Number(item.qty || 1) })),
      coupon_code: state.coupon?.applied ? state.coupon.code : "",
      mobile,
      address
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || t("checkoutFailed"));
  }
  if (window.onOrderCreated && data.order) {
    window.onOrderCreated(data.order);
  }
  clearCartAfterOrder();
  window.open(data.whatsapp_url, "_blank");
}

checkoutBtn.addEventListener("click", async () => {
  if (state.cart.length === 0) {
    alert(t("cartEmptyAlert"));
    return;
  }
  if (!state.customer) {
    alert("Please login to place an order and view it in My Orders.");
    openCustomerModal();
    return;
  }

 // try {
   // await tryRazorpayCheckout();
 // } catch {
    try {
      await fallbackWhatsAppCheckout();
    } catch (error) {
      alert(error.message || t("checkoutFailed"));
    }
  //}
});

inquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = t("sending");

  try {
    const response = await fetch(requireBackendPath("/api/inquiry"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t("inquiryFailed"));
    }

    formStatus.textContent = data.message || t("inquirySent");
    inquiryForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || t("inquiryFailed");
  }
});

catalogFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter || "all";
  renderCatalogFilters();
  renderProducts();
});

catalogSort?.addEventListener("change", () => {
  state.catalogSort = catalogSort.value;
  renderProducts();
});

async function loadProducts() {
  productGrid.innerHTML = `<p>${t("loadingInstruments")}</p>`;

  try {
    const response = await fetch(requireBackendPath("/api/products"));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t("loadFailed"));
    }
    const fetched = data.products || [];
    products = fetched;
    productsLoaded = true;
    renderCatalogFilters();
    hydrateCartWithProducts();
    renderProducts();
  } catch (error) {
    products = [...fallbackProducts];
    productsLoaded = true;
    renderCatalogFilters();
    hydrateCartWithProducts();
    renderProducts();
    productGrid.insertAdjacentHTML("beforeend", `<p>${error.message || t("loadFailed")}</p>`);
  }
}

const initialLanguage = localStorage.getItem("svayavaniLang") || "en";
applyLanguage(initialLanguage);
loadCartFromStorage();
loadProducts();
loadVideos();
loadOffers();
loadDeliveryInfo();
renderCart();
checkCustomerSession();
initPasswordToggles();
