const products = [
  { id: 1, name: "Ravi Style Sitar", category: "string", price: 45999, details: "Teak wood, hand-carved jawari" },
  { id: 2, name: "Concert Tabla Set", category: "percussion", price: 28999, details: "Sheesham dayan + copper bayan" },
  { id: 3, name: "Miraj Tanpura", category: "string", price: 37999, details: "Female pitch, polished toor wood" },
  { id: 4, name: "Bansuri Pro C", category: "wind", price: 3499, details: "Seasoned bamboo, concert tuning" },
  { id: 5, name: "Portable Harmonium", category: "keyboard", price: 21999, details: "9 stopper, coupler, scale changer" },
  { id: 6, name: "Pakhawaj Heritage", category: "percussion", price: 31999, details: "Hand-laced barrel, rich bass" }
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
    demoCheckoutAlert: "Demo checkout: Razorpay/WhatsApp flow will run in live backend mode.",
    demoInquirySubmitted: "Demo mode: inquiry submitted visually."
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
    demoCheckoutAlert: "डेमो चेकआउट: लाईव्ह बॅकएंडमध्ये Razorpay/WhatsApp फ्लो चालेल.",
    demoInquirySubmitted: "डेमो मोड: चौकशी दृश्यरित्या सबमिट झाली."
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
    demoCheckoutAlert: "डेमो चेकआउट: लाइव बैकएंड मोड में Razorpay/WhatsApp फ्लो चलेगा।",
    demoInquirySubmitted: "डेमो मोड: चौकशी दृश्य रूप से सबमिट हुई।"
  }
};

const state = { cart: [], filter: "all", language: "en" };

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
    card.innerHTML = `
      <img src="${resolveImage(product)}" alt="${product.name}" class="product-image" onerror="this.src='assets/images/sitar.svg'" />
      <h3>${product.name}</h3>
      <p class="product-meta">${product.details}</p>
      <div class="product-bottom">
        <span class="price">Rs ${formatINR(product.price)}</span>
        <button data-id="${product.id}">${t("addToCart")}</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
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

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
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

if (langSwitcher) {
  langSwitcher.addEventListener("change", () => {
    applyLanguage(langSwitcher.value);
  });
}

checkoutBtn.addEventListener("click", () => {
  if (state.cart.length === 0) {
    alert(t("cartEmptyAlert"));
    return;
  }
  alert(t("demoCheckoutAlert"));
});

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = t("demoInquirySubmitted");
  inquiryForm.reset();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    renderProducts();
  });
});

const initialLanguage = localStorage.getItem("svayavaniLang") || "en";
applyLanguage(initialLanguage);
renderProducts();
renderCart();
