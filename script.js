let products = [];
const defaultMedia = [
  "assets/images/sitar.svg",
  "assets/images/tabla.svg",
  "assets/images/tanpura.svg",
  "assets/images/bansuri.svg",
  "assets/images/harmonium.svg"
];
const fallbackProducts = [
  { id: 1, name: "Ravi Style Sitar", category: "string", price: 45999, details: "Teak wood, hand-carved jawari", images: defaultMedia, video_url: "assets/videos/sitar-making.mp4" },
  { id: 2, name: "Concert Tabla Set", category: "percussion", price: 28999, details: "Sheesham dayan + copper bayan", images: defaultMedia, video_url: "assets/videos/tabla-making.mp4" },
  { id: 3, name: "Miraj Tanpura", category: "string", price: 37999, details: "Female pitch, polished toor wood", images: defaultMedia, video_url: "assets/videos/harmonium-making.mp4" },
  { id: 4, name: "Bansuri Pro C", category: "wind", price: 3499, details: "Seasoned bamboo, concert tuning", images: defaultMedia, video_url: "assets/videos/sitar-making.mp4" },
  { id: 5, name: "Portable Harmonium", category: "keyboard", price: 21999, details: "9 stopper, coupler, scale changer", images: defaultMedia, video_url: "assets/videos/harmonium-making.mp4" },
  { id: 6, name: "Pakhawaj Heritage", category: "percussion", price: 31999, details: "Hand-laced barrel, rich bass", images: defaultMedia, video_url: "assets/videos/tabla-making.mp4" }
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
    customerLogin: "Customer Login",
    customerRegister: "Create Account",
    customerPassword: "Password",
    customerLogout: "Logout",
    customerAuthSuccess: "You are logged in.",
    customerAuthFailed: "Customer authentication failed."
  },
  mr: {
    navProducts: "उत्पादने",
    navAbout: "आमच्याबद्दल",
    navContact: "संपर्क",
    navAdmin: "अॅडमिन",
    cart: "कार्ट",
    heroEyebrow: "भारतामध्ये हस्तनिर्मित",
    heroTitle: "प्रत्येक रियाजसाठी भारतीय शास्त्रीय वाद्ये",
    heroDesc: "विश्वसनीय कारागिरांनी तयार केलेली कॉन्सर्ट-ग्रेड सितार, तबला, तानपूरा, हार्मोनियम आणि बासरी शोधा.",
    shopInstruments: "वाद्ये खरेदी करा",
    heroCardTitle: "मोफत ट्यूनिंग + सेटअप",
    heroCardDesc: "प्रत्येक ऑर्डरमध्ये डिलिव्हरीपूर्व गुणवत्ता तपासणी आणि तज्ज्ञांचे ट्यूनिंग मार्गदर्शन समाविष्ट आहे.",
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
    checkout: "चेकआउटकडे जा",
    addToCart: "कार्टमध्ये जोडा",
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
    customerAuthFailed: "ग्राहक प्रमाणीकरण अयशस्वी."
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
    customerAuthFailed: "ग्राहक प्रमाणीकरण विफल।"
  }
};

const state = {
  cart: [],
  filter: "all",
  language: "en",
  customer: null,
  videos: []
};

const productGrid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCartFooter = document.getElementById("closeCartFooter");
const inquiryForm = document.getElementById("inquiryForm");
const formStatus = document.getElementById("formStatus");
const langSwitcher = document.getElementById("langSwitcher");
const brandText = document.getElementById("brandText");
const brandLink = document.querySelector(".brand");
const customerAuthBtn = document.getElementById("customerAuthBtn");
const customerGreeting = document.getElementById("customerGreeting");
const customerModal = document.getElementById("customerModal");
const closeCustomerModal = document.getElementById("closeCustomerModal");
const customerAuthStatus = document.getElementById("customerAuthStatus");
const customerLoginForm = document.getElementById("customerLoginForm");
const customerRegisterForm = document.getElementById("customerRegisterForm");
const videoGrid = document.getElementById("videoGrid");
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const productModalTitle = document.getElementById("productModalTitle");
const productModalMeta = document.getElementById("productModalMeta");
const productMediaList = document.getElementById("productMediaList");
const productModalAddToCart = document.getElementById("productModalAddToCart");
const hasBackend = window.location.protocol === "http:" || window.location.protocol === "https:";

function requireBackendPath(path) {
  if (!hasBackend) {
    throw new Error("Backend API unavailable. Open this site via http://localhost:8080");
  }
  return path;
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
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function resolveImage(product) {
  const key = product.name.toLowerCase();
  if (key.includes("sitar")) return "assets/images/sitar.svg";
  if (key.includes("tabla")) return "assets/images/tabla.svg";
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
  productGrid.innerHTML = "";

  visibleProducts().forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-product-id", String(product.id));
    const image = product.images && product.images.length ? product.images[0] : resolveImage(product);
    const videoLink = product.video_url ? `<a href="${product.video_url}" target="_blank" rel="noopener noreferrer">${t("watchMakingVideo")}</a>` : "";
    card.innerHTML = `
      <img src="${image}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/sitar.svg'" />
      <h3>${product.name}</h3>
      <p class="product-meta">${product.details}</p>
      <p class="product-meta">${videoLink}</p>
      <div class="product-bottom">
        <span class="price">Rs ${formatINR(product.price)}</span>
        <button data-id="${product.id}">${t("addToCart")}</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function openProductModal(product) {
  if (!productModal || !productModalTitle || !productMediaList) return;
  productModalTitle.textContent = product.name;
  productModalMeta.textContent = `${product.category} | Rs ${formatINR(product.price)}`;
  productMediaList.innerHTML = "";

  const images = product.images && product.images.length ? product.images : [resolveImage(product)];
  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${product.name} photo ${index + 1}`;
    img.loading = "lazy";
    productMediaList.appendChild(img);
  });

  if (product.video_url) {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.src = product.video_url;
    productMediaList.appendChild(video);
  }

  productModalAddToCart.dataset.productId = String(product.id);
  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
}

function closeProductDetailsModal() {
  if (!productModal) return;
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
}

function renderCart() {
  cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p>${t("cartEmpty")}</p>`;
  } else {
    state.cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <strong>${item.name}</strong>
        <p>Rs ${formatINR(item.price)}</p>
        <button data-remove="${index}">${t("remove")}</button>
      `;
      cartItems.appendChild(row);
    });
  }

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatINR(total);
  cartCount.textContent = state.cart.length;
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
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
}

function openCustomerModal() {
  customerModal?.classList.add("open");
  customerModal?.setAttribute("aria-hidden", "false");
}

function closeCustomerAuthModal() {
  customerModal?.classList.remove("open");
  customerModal?.setAttribute("aria-hidden", "true");
  if (customerAuthStatus) customerAuthStatus.textContent = "";
}

function renderCustomerState() {
  if (!customerAuthBtn) return;
  if (state.customer) {
    customerAuthBtn.textContent = t("customerLogout");
    if (customerGreeting) customerGreeting.textContent = `Hi, ${state.customer.name}`;
    return;
  }
  customerAuthBtn.textContent = t("customerLogin");
  if (customerGreeting) customerGreeting.textContent = "";
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
      state.cart.push(selected);
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

});

cartBtn.addEventListener("click", () => {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
});

closeCart?.addEventListener("click", closeCartPanel);
closeCartFooter?.addEventListener("click", closeCartPanel);
closeProductModal?.addEventListener("click", closeProductDetailsModal);
productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) closeProductDetailsModal();
});
productModalAddToCart?.addEventListener("click", () => {
  const id = Number(productModalAddToCart.dataset.productId || "0");
  const selected = products.find((p) => p.id === id);
  if (selected) {
    state.cart.push(selected);
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
      await apiJSON("/api/customer/logout", { method: "POST", body: JSON.stringify({}) });
      state.customer = null;
      renderCustomerState();
    } catch (error) {
      if (customerAuthStatus) customerAuthStatus.textContent = error.message || t("customerAuthFailed");
    }
    return;
  }
  openCustomerModal();
});

closeCustomerModal?.addEventListener("click", closeCustomerAuthModal);
customerModal?.addEventListener("click", (event) => {
  if (event.target === customerModal) closeCustomerAuthModal();
});

customerLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (customerAuthStatus) customerAuthStatus.textContent = t("sending");

  try {
    const data = await apiJSON("/api/customer/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("customerLoginEmail").value,
        password: document.getElementById("customerLoginPassword").value
      })
    });

    state.customer = data.customer || null;
    renderCustomerState();
    customerLoginForm.reset();
    closeCustomerAuthModal();
  } catch (error) {
    if (customerAuthStatus) customerAuthStatus.textContent = error.message || t("customerAuthFailed");
  }
});

customerRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (customerAuthStatus) customerAuthStatus.textContent = t("sending");

  try {
    const data = await apiJSON("/api/customer/register", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("customerRegisterName").value,
        email: document.getElementById("customerRegisterEmail").value,
        password: document.getElementById("customerRegisterPassword").value
      })
    });

    state.customer = data.customer || null;
    renderCustomerState();
    customerRegisterForm.reset();
    closeCustomerAuthModal();
  } catch (error) {
    if (customerAuthStatus) customerAuthStatus.textContent = error.message || t("customerAuthFailed");
  }
});

async function tryRazorpayCheckout() {
  const response = await fetch(requireBackendPath("/api/payment/razorpay/order"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: state.cart.map((item) => ({ name: item.name, price: item.price }))
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
    },
    theme: { color: "#8e3b2f" }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

async function fallbackWhatsAppCheckout() {
  const response = await fetch(requireBackendPath("/api/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: state.cart.map((item) => ({ name: item.name, price: item.price }))
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || t("checkoutFailed"));
  }
  window.open(data.whatsapp_url, "_blank");
}

checkoutBtn.addEventListener("click", async () => {
  if (state.cart.length === 0) {
    alert(t("cartEmptyAlert"));
    return;
  }

  try {
    await tryRazorpayCheckout();
  } catch {
    try {
      await fallbackWhatsAppCheckout();
    } catch (error) {
      alert(error.message || t("checkoutFailed"));
    }
  }
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
    products = data.products || [];
    renderProducts();
  } catch (error) {
    products = [...fallbackProducts];
    renderProducts();
    productGrid.insertAdjacentHTML("beforeend", `<p>${error.message || t("loadFailed")}</p>`);
  }
}

const initialLanguage = localStorage.getItem("svayavaniLang") || "en";
applyLanguage(initialLanguage);
loadProducts();
loadVideos();
renderCart();
checkCustomerSession();
initPasswordToggles();
