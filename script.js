let products = [];
let productGalleryKeyHandler = null;
const fallbackProducts = [
  {
    id: 1,
    name: "Ravi Style Sitar",
    category: "string",
    price: 45999,
    details: "Teak wood, hand-carved jawari",
    images: ["assets/images/sitar_1.jpg"],
    care: "Wipe bridges and strings after each practice, store in padded case, and keep humidity near 50%.",
    sound: "Golden bass with shimmering drones and articulate mids designed for alap and jhala.",
    story: "Carved in Kolkata by the Ravi family, embracing three generations of sitar craftsmanship.",
    video_url: "assets/videos/sitar-making.mp4"
  },
  {
    id: 2,
    name: "Concert Tabla Set",
    category: "percussion",
    price: 28999,
    details: "Sheesham dayan + copper bayan",
    images: ["assets/Tabla/tabla_1.jpg"],
    care: "Keep heads dry, dust with soft cloth, and loosen straps slightly for storage.",
    sound: "Cracking dayan slaps with thunderous bayan booms tuned for traditional thekas.",
    story: "Miraj artisans sculpt the dayan from sheesham and copper for balanced resonance.",
    video_url: "assets/videos/tabla-making.mp4"
  },
  {
    id: 3,
    name: "Miraj Tanpura",
    category: "string",
    price: 37999,
    details: "Female pitch, polished toor wood",
    images: ["assets/images/tanpura.svg"],
    care: "Store upright in silk cover, polish the bridge, and avoid impacts.",
    sound: "Lush sympathetic drones that bloom underneath vocals and instruments.",
    story: "Hand-assembled in Miraj with aged toor wood and sympathetic string tensioning.",
    video_url: "assets/videos/harmonium-making.mp4"
  },
  {
    id: 4,
    name: "Bansuri Pro C",
    category: "wind",
    price: 3499,
    details: "Seasoned bamboo, concert tuning",
    images: ["assets/images/bansuri.svg"],
    care: "Wipe dry, keep in padded sleeve, and avoid rain exposure.",
    sound: "Clear, airy projection with warm bottom end and bright upper register.",
    story: "Bamboo sourced from North India and tuned by Varanasi artisans for pro gigs.",
    video_url: "assets/videos/sitar-making.mp4"
  },
  {
    id: 5,
    name: "Portable Harmonium",
    category: "keyboard",
    price: 21999,
    details: "9 stopper, coupler, scale changer",
    images: ["assets/images/indian-scale-changer-harmonium.jpg"],
    care: "Keep bellows dust-free, oil joints lightly, and store upright with key cover.",
    sound: "Sympathetic bass, responsive treble, and lush sustain for accompaniment.",
    story: "Built in a family workshop with double reed system and polished maple finish.",
    video_url: "assets/videos/harmonium-making.mp4"
  },
  {
    id: 6,
    name: "Pakhawaj Heritage",
    category: "percussion",
    price: 31999,
    details: "Hand-laced barrel, rich bass",
    images: ["assets/images/pakhawaj.svg"],
    care: "Avoid temperature swings, keep lashings taut, and dust the shell regularly.",
    sound: "Deep bass thud with crisp treble slaps tuned for dhrupad.",
    story: "Hand-laced in Gwalior tradition for authentic tonal balance.",
    video_url: "assets/videos/tabla-making.mp4"
  }
];

const defaultVideos = [
  { id: 1, titleKey: "videoSitar", url: "assets/videos/sitar-making.mp4" },
  { id: 2, titleKey: "videoTabla", url: "assets/videos/tabla-making.mp4" },
  { id: 3, titleKey: "videoHarmonium", url: "assets/videos/harmonium-making.mp4" }
];

const translations = {
  en: {
    navProducts: "Products",
    navAbout: "About",
    navContact: "Contact",
    navAdmin: "Admin",
    cart: "Cart",
    heroEyebrow: "Handcrafted in India",
    heroTitle: "Indian Classical Instruments for Every Riyaaz",
    heroDesc: "Discover concert-grade sitars, tablas, tanpuras, harmoniums, and flutes crafted by trusted artisans.",
    shopInstruments: "Shop Instruments",
    heroCardTitle: "Free Tuning + Setup",
    heroCardDesc: "Every order includes pre-delivery quality check and tuning guidance from our experts.",
    profileTitle: "Your Profile",
    profileGreeting: "Welcome back,",
    profileSince: "Member since",
    featuredInstruments: "Featured Instruments",
    filter_all: "All",
    filter_string: "String",
    filter_percussion: "Percussion",
    filter_wind: "Wind",
    filter_keyboard: "Keyboard",
    aboutTitle: "Why Musicians Choose स्वयंवाणी",
    aboutPoint1: "Verified artisan network across Kolkata, Miraj, and Varanasi",
    aboutPoint2: "Careful climate-safe packaging for domestic and international shipping",
    aboutPoint3: "Video quality checks before dispatch",
    aboutPoint4: "Dedicated support for beginners and professional performers",
    aboutHelpTitle: "Need help choosing?",
    aboutHelpDesc: "Share your level, budget, and style. We'll recommend the right instrument and setup within 24 hours.",
    videosTitle: "Instrument Making Videos",
    videosDesc: "Watch how our artisans shape, tune, and finish each instrument.",
    videoSitar: "Sitar Making Process",
    videoTabla: "Tabla Skin & Tuning Craft",
    videoHarmonium: "Harmonium Reed Setup",
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
    contactTitle: "Contact Us",
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
    couponUnavailable: "No coupon available right now.",
  },
  mr: {
    navProducts: "उत्पादने",
    navAbout: "आमच्या बद्दल",
    navContact: "संपर्क",
    navAdmin: "ॲडमिन",
    cart: "कार्ट",
    heroEyebrow: "भारतामध्ये हस्तनिर्मित",
    heroTitle: "प्रत्येक रियाजसाठी भारतीय शास्त्रीय वाद्ये",
    heroDesc: "विश्वसनीय कारागिरांनी तयार केलेली कॉन्सर्ट-ग्रेड सितार, तबला, तानपूरा, हार्मोनियम आणि बासरी शोधा.",
    shopInstruments: "वाद्ये खरेदी करा",
    heroCardTitle: "मोफत ट्यूनिंग + सेटअप",
    heroCardDesc: "प्रत्येक ऑर्डरमध्ये डिलिव्हरीपूर्व गुणवत्ता तपासणी आणि तज्ज्ञांचे ट्यूनिंग मार्गदर्शन समाविष्ट आहे.",
    profileTitle: "तुमचे प्रोफाइल",
    profileGreeting: "पुन्हा स्वागत आहे,",
    profileSince: "सदस्यत्वाची सुरुवात",
    featuredInstruments: "प्रमुख वाद्ये",
    filter_all: "सर्व",
    filter_string: "तंतुवाद्य",
    filter_percussion: "तालवाद्य",
    filter_wind: "वायुवाद्य",
    filter_keyboard: "कीबोर्ड",
    aboutTitle: "संगीतकार स्वयंवाणी का निवडतात",
    aboutPoint1: "कोलकाता, मिरज आणि वाराणसी येथील प्रमाणित कारागीर नेटवर्क",
    aboutPoint2: "देशांतर्गत आणि आंतरराष्ट्रीय शिपिंगसाठी सुरक्षित पॅकेजिंग",
    aboutPoint3: "पाठवण्यापूर्वी व्हिडिओ गुणवत्ता तपासणी",
    aboutPoint4: "नवशिक्या आणि व्यावसायिक कलाकारांसाठी समर्पित मदत",
    aboutHelpTitle: "योग्य वाद्य निवडण्यात मदत हवी?",
    aboutHelpDesc: "तुमची पातळी, बजेट आणि शैली सांगा. आम्ही 24 तासांत योग्य वाद्य आणि सेटअप सुचवू.",
    videosTitle: "वाद्यनिर्मिती व्हिडिओ",
    videosDesc: "आमचे कारागीर वाद्य कसे तयार, ट्यून आणि फिनिश करतात ते पाहा.",
    videoSitar: "सितार बनवण्याची प्रक्रिया",
    videoTabla: "तबला स्किन आणि ट्यूनिंग कला",
    videoHarmonium: "हार्मोनियम रीड सेटअप",
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
    contactTitle: "आमच्याशी संपर्क साधा",
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
    customerLogout: "लॉगआउट",
    customerAuthSuccess: "तुम्ही लॉगिन आहात.",
    customerRegisterSuccess: "खाते यशस्वीरित्या तयार झाले आहे आणि आपला युजर आयडी व पासवर्ड ईमेलवर पाठवला गेला आहे.",
    customerAuthFailed: "ग्राहक प्रमाणीकरण अयशस्वी.",
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
    navProducts: "उत्पाद",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क",
    navAdmin: "एडमिन",
    cart: "कार्ट",
    heroEyebrow: "भारत में हस्तनिर्मित",
    heroTitle: "हर रियाज़ के लिए भारतीय शास्त्रीय वाद्य",
    heroDesc: "विश्वसनीय कारीगरों द्वारा बनाए गए कॉन्सर्ट-ग्रेड सितार, तबला, तानपुरा, हारमोनियम और बांसुरी खोजें।",
    shopInstruments: "वाद्य खरीदें",
    heroCardTitle: "मुफ्त ट्यूनिंग + सेटअप",
    heroCardDesc: "हर ऑर्डर में डिलीवरी से पहले गुणवत्ता जांच और विशेषज्ञ ट्यूनिंग मार्गदर्शन शामिल है।",
    profileTitle: "आपकी प्रोफ़ाइल",
    profileGreeting: "फिर से स्वागत है,",
    profileSince: "सदस्यता प्रारंभ",
    featuredInstruments: "विशेष वाद्य",
    filter_all: "सभी",
    filter_string: "तार वाद्य",
    filter_percussion: "ताल वाद्य",
    filter_wind: "वायु वाद्य",
    filter_keyboard: "कीबोर्ड",
    aboutTitle: "संगीतकार स्वयंवाणी क्यों चुनते हैं",
    aboutPoint1: "कोलकाता, मिराज और वाराणसी में प्रमाणित कारीगर नेटवर्क",
    aboutPoint2: "देश और विदेश शिपिंग के लिए सुरक्षित पैकेजिंग",
    aboutPoint3: "डिस्पैच से पहले वीडियो गुणवत्ता जांच",
    aboutPoint4: "शुरुआती और पेशेवर कलाकारों के लिए समर्पित सहायता",
    aboutHelpTitle: "सही वाद्य चुनने में मदद चाहिए?",
    aboutHelpDesc: "अपना स्तर, बजट और शैली बताएं। हम 24 घंटे में सही वाद्य और सेटअप सुझाएंगे।",
    videosTitle: "वाद्य बनाने के वीडियो",
    videosDesc: "देखें हमारे कारीगर हर वाद्य को कैसे बनाते, ट्यून करते और फिनिश करते हैं।",
    videoSitar: "सितार बनाने की प्रक्रिया",
    videoTabla: "तबला स्किन और ट्यूनिंग कला",
    videoHarmonium: "हारमोनियम रीड सेटअप",
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
    contactTitle: "संपर्क करें",
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
    customerLogout: "लॉगआउट",
    customerAuthSuccess: "आप लॉगिन हैं।",
    customerAuthFailed: "ग्राहक प्रमाणीकरण विफल।",
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
const showRegisterLink = document.getElementById("showRegisterLink");
const backToLoginLink = document.getElementById("backToLoginLink");
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
const customerProfileToggle = document.getElementById("customerProfileToggle");
const profileMenu = document.getElementById("profileMenu");
const profileDropdown = document.getElementById("profileDropdown");
const dropdownOrders = document.getElementById("dropdownOrders");
const dropdownLogout = document.getElementById("dropdownLogout");
const navLinks = document.querySelectorAll(".main-nav a, .brand, .cta");
let isCustomerProfileVisible = false;

function toggleRegisterForm(show) {
  if (!customerLoginForm || !customerRegisterForm) return;
  const shouldShow = typeof show === "boolean" ? show : customerRegisterForm.classList.contains("hidden");
  if (shouldShow) {
    customerRegisterForm.classList.remove("hidden");
    customerLoginForm.classList.add("hidden");
    const firstField = document.getElementById("customerRegisterName");
    if (firstField) firstField.focus();
  } else {
    customerRegisterForm.classList.add("hidden");
    customerLoginForm.classList.remove("hidden");
    customerLoginForm.querySelector("input")?.focus();
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

// initial state
toggleRegisterForm(false);

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
const LOYALTY_DISCOUNT_RATE = 0.1;

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
    return Math.round(LOYALTY_DISCOUNT_RATE * 100);
  }
  if (state.customer && state.activeOfferType !== "lessons") {
    return Math.round(LOYALTY_DISCOUNT_RATE * 100);
  }
  return 0;
}

function getActiveDiscountLabel() {
  if (state.activeOfferType === "coupon" && state.coupon?.applied && state.coupon.code) {
    return `${state.coupon.code} coupon`;
  }
  if (state.activeOfferType === "discount" && state.customer) return t("offerDiscountTitle");
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

function t(key) {
  const group = translations[state.language] || translations.en;
  return group[key] || translations.en[key] || key;
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
    element.textContent = t(element.dataset.i18n);
  });

  if (langSwitcher) {
    langSwitcher.value = state.language;
  }

  renderProducts();
  renderCart();
  renderCustomerState();
  renderVideos();
  applyOfferOverrides();
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
  const key = product.name.toLowerCase();
  if (key.includes("sitar")) return "assets/images/sitar.svg";
  if (key.includes("tabla")) return "assets/Tabla/tabla_1.jpg";
  if (key.includes("tanpura")) return "assets/images/tanpura.svg";
  if (key.includes("bansuri") || key.includes("flute")) return "assets/images/bansuri.svg";
  if (key.includes("harmonium")) return "assets/images/harmonium.svg";
  if (key.includes("pakhawaj")) return "assets/images/pakhawaj.svg";
  return "assets/images/sitar.svg";
}

function visibleProducts() {
  if (state.filter === "all") return products;
  return products.filter((p) => p.category === state.filter);
}

function renderProducts() {
  if (!products || products.length === 0) {
    products = [...fallbackProducts];
  }
  productGrid.innerHTML = "";
  const items = visibleProducts();
  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-product-id", String(product.id));
    const image = product.images && product.images.length ? product.images[0] : resolveImage(product);
    const discountPct = getActiveDiscountPercent();
    const dealPrice = discountPct > 0 ? getCartItemFinalPrice(product) : product.price;
    const savings = discountPct > 0 ? product.price - dealPrice : 0;
    card.innerHTML = `
      <img src="${image}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/sitar.svg'" />
      <h3>${product.name}</h3>
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
        <button class="product-cta" data-id="${product.id}"><span>${t("addToCart")}</span></button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // If nothing rendered (e.g., products unexpectedly empty or filter mismatch), fall back once.
  if (productGrid.children.length === 0 && fallbackProducts.length > 0) {
    products = [...fallbackProducts];
    state.filter = "all";
    productGrid.innerHTML = "";
    visibleProducts().forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("data-product-id", String(product.id));
      const image = product.images && product.images.length ? product.images[0] : resolveImage(product);
      const discountPct = getActiveDiscountPercent();
      const dealPrice = discountPct > 0 ? getCartItemFinalPrice(product) : product.price;
      const savings = discountPct > 0 ? product.price - dealPrice : 0;
      card.innerHTML = `
        <img src="${image}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/sitar.svg'" />
        <h3>${product.name}</h3>
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
          <button class="product-cta" data-id="${product.id}"><span>${t("addToCart")}</span></button>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }
}

function ensureProductsVisible() {
  if (!products || products.length === 0) {
    products = [...fallbackProducts];
  }
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
  productModalMeta.innerHTML =
    discountPct > 0
      ? `${product.category} | ${formatINR(dealPrice)} <span class="price-original">${formatINR(
          product.price
        )}</span> <span class="price-pct">(${discountPct}% off)</span>`
      : `${product.category} | ${formatINR(product.price)}`;
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
    <p class="modal-desc"></p>
  `;
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
        image.src = "assets/images/sitar.svg";
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
  updateOfferVisibility();
}

async function loadOffers() {
  if (!hasBackend) {
    state.activeOfferType = null;
    if (offerGridDynamic) offerGridDynamic.innerHTML = "";
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
      updateOfferVisibility();
      return;
    }
    applyOfferOverrides({
      offerType: config.offerType,
      title: config.title,
      desc: config.desc,
      discountTitle: config.discountTitle,
      discountDesc: config.discountDesc,
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
  const { name, email, created_at: createdAt } = state.customer;
  customerProfileName.textContent = name || "";
  customerProfileEmail.textContent = email || "";
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
      const existing = state.cart.find((item) => item.id === selected.id);
      if (existing) {
        existing.qty = Number(existing.qty || 1) + 1;
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
      state.cart[idx].qty = Number(state.cart[idx].qty || 1) + 1;
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
    const existing = state.cart.find((item) => item.id === selected.id);
    if (existing) {
      existing.qty = Number(existing.qty || 1) + 1;
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
  profileMenu.classList.add("open");
  profileDropdown.setAttribute("aria-hidden", "false");
  customerProfileToggle?.setAttribute("aria-expanded", "true");
}
function closeProfileDropdown() {
  if (!profileMenu || !profileDropdown) return;
  profileMenu.classList.remove("open");
  profileDropdown.setAttribute("aria-hidden", "true");
  if (profileDropdown.contains(document.activeElement)) {
    customerProfileToggle?.focus();
  }
  customerProfileToggle?.setAttribute("aria-expanded", "false");
}
profileMenu?.addEventListener("mouseenter", () => {
  if (profileDropdownTimeout) clearTimeout(profileDropdownTimeout);
  openProfileDropdown();
});
profileMenu?.addEventListener("mouseleave", () => {
  profileDropdownTimeout = setTimeout(closeProfileDropdown, 120);
});
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
  if (!profileMenu.contains(e.target)) {
    closeProfileDropdown();
  }
});

dropdownOrders?.addEventListener("click", () => {
  closeProfileDropdown();
  if (typeof openOrdersModal === "function") openOrdersModal();
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
      items: state.cart.map((item) => ({ name: item.name, price: getCartItemFinalPrice(item) * (item.qty || 1) }))
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
      items: state.cart.map((item) => ({
        name: item.name,
        price: getCartItemFinalPrice(item) * (item.qty || 1),
        qty: item.qty || 1,
        image: (item.images && item.images[0]) || ""
      })),
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

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    renderProducts();
  });
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
    products = fetched.length > 0 ? fetched : [...fallbackProducts];
    hydrateCartWithProducts();
    renderProducts();
  } catch (error) {
    products = [...fallbackProducts];
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
renderCart();
checkCustomerSession();
initPasswordToggles();
