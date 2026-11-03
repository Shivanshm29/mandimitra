import type { SupportedLanguage } from '../types/auth';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    mandiIntelligence: string;
    sellingRecommendations: string;
    transactions: string;
    payments: string;
    profitCoach: string;
    sarvamAssistant: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
  };
  auth: {
    welcomeBack: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    username: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    phoneNumber: string;
    optional: string;
    state: string;
    district: string;
    village: string;
    locality: string;
    preferredLanguage: string;
    submitLogin: string;
    submitRegister: string;
    noAccount: string;
    haveAccount: string;
    loggingIn: string;
    registering: string;
    loginSuccess: string;
    registerSuccess: string;
    passwordMismatch: string;
  };
  dashboard: {
    welcome: string;
    overviewSubtitle: string;
    locationBadge: string;
    platformBanner: string;
    verifiedDataNotice: string;
    askSarvamVoiceBtn: string;
    recordSaleBtn: string;
    recordSaleSubtitle: string;
    scanBillBtn: string;
    scanBillSubtitle: string;
    profitCoachBtn: string;
    profitCoachSubtitle: string;
    recentTransactions: string;
    viewAllRecords: string;
    noRecentTransactions: string;
    firstSaleAction: string;
    traderLabel: string;
    grossLabel: string;
    netLabel: string;
    outstandingLabel: string;
    settledLabel: string;
    partialLabel: string;
    pendingLabel: string;
    cardMandi: { title: string; desc: string; action: string };
    cardRecommendations: { title: string; desc: string; action: string };
    cardTransactions: { title: string; desc: string; action: string };
    cardPayments: { title: string; desc: string; action: string };
    cardSarvam: { title: string; desc: string; action: string };
  };
  harvest: {
    title: string;
    subtitle: string;
    addHarvestBtn: string;
    createLotBtn: string;
    cropLabel: string;
    selectCropPrompt: string;
    noCropsAlert: string;
    addCropToProfile: string;
    harvestDateLabel: string;
    qtyLabel: string;
    remainingLabel: string;
    totalHarvested: string;
    unitLabel: string;
    gradeLabel: string;
    storageLabel: string;
    notesLabel: string;
    saving: string;
    saveSuccess: string;
    emptyTitle: string;
    emptyDesc: string;
    statusAvailable: string;
    statusPartial: string;
    statusSold: string;
    createLotTitle: string;
    createLotDesc: string;
    lotQtyLabel: string;
    expectedRateLabel: string;
    oversellWarning: string;
    convertSuccess: string;
    cancelBtn: string;
    saveBtn: string;
    deleteConfirm: string;
  };
  lots: {
    title: string;
    subtitle: string;
    addLotBtn: string;
    available: string;
    sold: string;
    total: string;
    emptyTitle: string;
    emptyDesc: string;
    createModalTitle: string;
    statusAvailable: string;
    statusPartial: string;
    statusSold: string;
    cancelBtn: string;
    saveBtn: string;
    deleteConfirm: string;
  };
  mandi: {
    title: string;
    subtitle: string;
    govVerifiedBadge: string;
    refreshBtn: string;
    livePricesTab: string;
    alertsTab: string;
    allDistricts: string;
    searchPlaceholder: string;
    voiceSearchTooltip: string;
    modalPrice: string;
    minPrice: string;
    maxPrice: string;
    arrivals: string;
    arrivalDate: string;
    yourCrop: string;
    setAlertBtn: string;
    addAlertTitle: string;
    addAlertSubtitle: string;
    targetRateLabel: string;
    conditionLabel: string;
    above: string;
    below: string;
    saveAlert: string;
    noPricesFound: string;
    activeAlertsTitle: string;
    activeAlertsSubtitle: string;
    noAlertsFound: string;
    noAlertsDesc: string;
    createFirstAlert: string;
  };
  recommendations: {
    title: string;
    subtitle: string;
    bestMarketTitle: string;
    highestPriceLabel: string;
    extraGainLabel: string;
    rankLabel: string;
    reasoningTitle: string;
    marketName: string;
    difference: string;
    calculateForQuantity: string;
    noRecommendations: string;
    badgeAdvisor: string;
    commodityLabel: string;
    quantityLabel: string;
    varietyLabel: string;
    findBestRateBtn: string;
    selectHarvestLot: string;
    useExistingLot: string;
    manualExplore: string;
    noLotsFound: string;
    noLotsDesc: string;
    bestPriceBadge: string;
    convenientLocalBadge: string;
    bestOverallBadge: string;
    sortBy: string;
    sortByPrice: string;
    sortByLocation: string;
    sortByDate: string;
    sellAtThisMandi: string;
    grossRealization: string;
    grossRange: string;
    disclaimerNotice: string;
  };
  transactions: {
    title: string;
    subtitle: string;
    newSaleBtn: string;
    recordPaymentBtn: string;
    grossAmount: string;
    netReceivable: string;
    totalDeductions: string;
    receivedAmount: string;
    outstandingAmount: string;
    allRecords: string;
    searchPlaceholder: string;
    voiceSearchTooltip: string;
    trader: string;
    market: string;
    date: string;
    settled: string;
    partial: string;
    pending: string;
    details: string;
    ratePerUnit: string;
    deductionsBreakdown: string;
    notes: string;
    evidenceAttached: string;
    videoEvidenceAttached: string;
    receiptEvidenceAttached: string;
    viewEvidence: string;
    voiceNote: string;
    noSalesTitle: string;
    noSalesDesc: string;
    filterNoResult: string;
  };
  payments: {
    title: string;
    subtitle: string;
    recordPaymentBtn: string;
    totalReceived: string;
    pendingReceivables: string;
    settlementRate: string;
    paymentHistory: string;
    searchPlaceholder: string;
    amount: string;
    paymentMode: string;
    cash: string;
    upi: string;
    cheque: string;
    bankTransfer: string;
    paymentDate: string;
    referenceNote: string;
    linkedSale: string;
    noPaymentsTitle: string;
    noPaymentsDesc: string;
    receivedBadge: string;
    evidenceReceipt: string;
    viewReceipt: string;
  };
  profitCoach: {
    title: string;
    subtitle: string;
    debtorsTitle: string;
    debtorsDesc: string;
    benchmarkTitle: string;
    benchmarkDesc: string;
    auditTitle: string;
    auditDesc: string;
    daysOverdue: string;
    riskHigh: string;
    riskMedium: string;
    riskLow: string;
    realizedPrice: string;
    mandiBenchmark: string;
    priceGain: string;
    priceLag: string;
    totalDeductionsPaid: string;
    actionAdvice: string;
  };
  scanner: {
    title: string;
    subtitle: string;
    cameraTab: string;
    uploadTab: string;
    videoTab: string;
    textTab: string;
    takePhoto: string;
    rotate: string;
    retake: string;
    selectImage: string;
    selectVideo: string;
    textPlaceholder: string;
    extractBtn: string;
    reviewTitle: string;
    confidence: string;
    gross: string;
    deductions: string;
    net: string;
    draftNotice: string;
    scanAgain: string;
    confirmSale: string;
    evidenceAttached: string;
    videoAttached: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    listening: string;
    processing: string;
    speakBtn: string;
    sendBtn: string;
    quickPromptsTitle: string;
    actionProposalTitle: string;
    confirmExecution: string;
    cancelExecution: string;
    executing: string;
    executedSuccess: string;
    audioVoice: string;
  };
  profile: {
    title: string;
    subtitle: string;
    editProfile: string;
    saveChanges: string;
    saving: string;
    updateSuccess: string;
    memberSince: string;
    accountDetails: string;
    locationInfo: string;
  };
  common: {
    maharashtra: string;
    save: string;
    cancel: string;
    loading: string;
    error: string;
    phaseNotice: string;
    phaseNoticeDesc: string;
    backToDashboard: string;
    retry: string;
    close: string;
    delete: string;
    edit: string;
    confirm: string;
    optional: string;
    required: string;
    success: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  'mr-IN': {
    appName: 'मंडीमित्र',
    tagline: 'शेतकरी बाजार आणि आर्थिक बुद्धिमत्ता मंच',
    nav: {
      dashboard: 'डॅशबोर्ड',
      mandiIntelligence: 'मंडी भाव',
      sellingRecommendations: 'विक्री सल्ला',
      transactions: 'विक्री नोंदी',
      payments: 'जमा-खर्च व देणी',
      profitCoach: 'नफा सल्लागार',
      sarvamAssistant: 'सर्वम AI सहाय्यक',
      profile: 'माझे प्रोफाईल',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      register: 'नोंदणी करा',
    },
    auth: {
      welcomeBack: 'स्वागत आहे',
      loginTitle: 'मंडीमित्र मध्ये लॉगिन करा',
      loginSubtitle: 'आपल्या शेतीमालाचे योग्य भाव व हिशोब एकाच ठिकाणी',
      registerTitle: 'शेतकरी नवीन नोंदणी',
      registerSubtitle: 'आपल्या जिल्ह्यातील अधिकृत बाजारभावांशी जुळा',
      username: 'वापरकर्ता नाव (Username)',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्डची खात्री करा',
      displayName: 'पूर्ण नाव',
      phoneNumber: 'मोबाईल नंबर',
      optional: 'ऐच्छिक',
      state: 'राज्य',
      district: 'जिल्हा',
      village: 'गाव / तालुका',
      locality: 'पत्ता / गल्ली',
      preferredLanguage: 'पसंतीची भाषा',
      submitLogin: 'लॉगिन करा',
      submitRegister: 'नोंदणी पूर्ण करा',
      noAccount: 'नवीन आहात का? येथे नोंदणी करा',
      haveAccount: 'आधीच खाते आहे का? येथे लॉगिन करा',
      loggingIn: 'लॉगिन होत आहे...',
      registering: 'नोंदणी होत आहे...',
      loginSuccess: 'यशस्वीरित्या लॉगिन झाले!',
      registerSuccess: 'नोंदणी यशस्वी झाली!',
      passwordMismatch: 'दोन्ही पासवर्ड जुळत नाहीत.',
    },
    dashboard: {
      welcome: 'रामराम,',
      overviewSubtitle: 'आपल्या शेतीमालाचे ताजे बाजारभाव आणि आर्थिक नोंदींचे व्यवस्थापन.',
      locationBadge: 'नोंदणीकृत गाव',
      platformBanner: 'महाराष्ट्र शेतकरी मंच',
      verifiedDataNotice: 'AGMARKNET थेट दर पडताळणी',
      askSarvamVoiceBtn: 'बोलून विचारा / Ask Sarvam AI',
      recordSaleBtn: 'नवीन विक्री नोंदवा',
      recordSaleSubtitle: 'तोल पावती व कपातींसह',
      scanBillBtn: 'काटा पावती स्कॅन',
      scanBillSubtitle: 'AI कॅमेरा पावती वाचक',
      profitCoachBtn: 'नफा सल्लागार',
      profitCoachSubtitle: 'थकबाकी व दर विश्लेषण',
      recentTransactions: 'अलीकडील व्यवहार',
      viewAllRecords: 'सर्व नोंदी पहा',
      noRecentTransactions: 'अद्याप कोणतीही विक्री नोंदवलेली नाही.',
      firstSaleAction: 'पहिली विक्री नोंदवा',
      traderLabel: 'व्यापारी:',
      grossLabel: 'एकूण रक्कम:',
      netLabel: 'निव्वळ देय:',
      outstandingLabel: 'बाकी:',
      settledLabel: 'पूर्ण जमा',
      partialLabel: 'अंशतः जमा',
      pendingLabel: 'थकीत',
      cardMandi: {
        title: 'मंडी भाव विश्लेषण',
        desc: 'महाराष्ट्र व देशभरातील सरकारी नोंदणीकृत बाजारभाव, आवक आणि किमान/कमाल दर तपासा.',
        action: 'बाजारभाव पहा',
      },
      cardRecommendations: {
        title: 'शेतमाल विक्री सल्लागार',
        desc: 'आपल्या पिकासाठी आणि उपलब्ध मालासाठी सर्वात जास्त मोडल दर देणारी योग्य मंडी शोधा.',
        action: 'सल्ला मिळवा',
      },
      cardTransactions: {
        title: 'शेतीमाल विक्री नोंदी',
        desc: 'व्यापारी, तोल पावती, वजन व हमाली/कमिशन कपातींची अचूक नोंद ठेवा.',
        action: 'नोंदी पहा',
      },
      cardPayments: {
        title: 'बाकी रक्कम व पेमेंट्स',
        desc: 'व्यापाऱ्यांकडून येणे बाकी असलेली रक्कम आणि हप्त्यांची खात्रीशीर आकडेमोड करा.',
        action: 'देणी तपासा',
      },
      cardSarvam: {
        title: 'सर्वम AI कृषी सहाय्यक',
        desc: 'मराठी व हिंदी भाषेत बोलून किंवा पावतीचा फोटो पाठवून हिशोब समजून घ्या.',
        action: 'AI सह संवाद साधा',
      },
    },
    harvest: {
      title: 'काढणी व शेतमाल साठा (Harvest Records)',
      subtitle: 'शेतमालाची काढणी नोंदवा आणि त्यातून थेट विक्री लॉट तयार करा.',
      addHarvestBtn: '+ नवीन काढणी नोंदवा',
      createLotBtn: 'विक्री लॉट बनवा',
      cropLabel: 'शेतमाल / पीक',
      selectCropPrompt: '-- पीक निवडा --',
      noCropsAlert: 'तुमच्या प्रोफाईलमध्ये अद्याप पिके नोंदवलेली नाहीत.',
      addCropToProfile: 'प्रोफाईलमध्ये पीक जोडा',
      harvestDateLabel: 'काढणी तारीख',
      qtyLabel: 'काढणी परिमाण (क्विंटल)',
      remainingLabel: 'शिल्लक काढणी साठा',
      totalHarvested: 'एकूण काढणी',
      unitLabel: 'एकक (Unit)',
      gradeLabel: 'दर्जा (Quality Grade)',
      storageLabel: 'साठवणूक ठिकाण / गोदाम',
      notesLabel: 'शेरा / टीप',
      saving: 'जतन करत आहे...',
      saveSuccess: 'काढणी यशस्वीरीत्या नोंदवली गेली!',
      emptyTitle: 'कोणतीही काढणी नोंद सापडली नाही',
      emptyDesc: 'काढणी केलेला शेतमाल येथे नोंदवा, जेणेकरून विक्री करताना शिल्लक साठा आपोआप मोजला जाईल.',
      statusAvailable: 'उपलब्ध',
      statusPartial: 'अंशतः विक्री',
      statusSold: 'पूर्ण विकला',
      createLotTitle: 'काढणी साठ्यातून विक्री लॉट तयार करा',
      createLotDesc: 'या काढणीतून बाजारात विक्रीसाठी उपलब्ध करावयाचा साठा ठरवा.',
      lotQtyLabel: 'विक्री लॉट परिमाण (क्विंटल)',
      expectedRateLabel: 'अपेक्षित दर (₹/क्विंटल - ऐच्छिक)',
      oversellWarning: 'लॉट परिमाण शिल्लक काढणी साठ्यापेक्षा जास्त असू शकत नाही.',
      convertSuccess: 'विक्री लॉट यशस्वीरीत्या तयार झाला!',
      cancelBtn: 'रद्द करा',
      saveBtn: 'काढणी जतन करा',
      deleteConfirm: 'तुम्हाला ही काढणी नोंद नक्की हटवायची आहे का?',
    },
    lots: {
      title: 'शेतमाल साठा व विक्री लॉट्स (Produce Lots)',
      subtitle: 'तुमचा शिल्लक शेतमाल, विक्री झालेला साठा व लॉट शिल्लक व्यवस्थापित करा.',
      addLotBtn: '+ नवीन लॉट जोडा',
      available: 'उपलब्ध साठा',
      sold: 'विक्री झाली',
      total: 'एकूण साठा',
      emptyTitle: 'कोणताही शेतमाल लॉट नोंदवलेला नाही',
      emptyDesc: 'तुमचा काढणी केलेला शेतमाल जोडा जेणेकरून विक्री नोंदवताना साठा आपोआप कमी होईल.',
      createModalTitle: 'नवीन शेतमाल लॉट नोंदवा',
      statusAvailable: 'उपलब्ध',
      statusPartial: 'अंशतः विकलेला',
      statusSold: 'पूर्ण विकला',
      cancelBtn: 'रद्द करा',
      saveBtn: 'लॉट सेव्ह करा',
      deleteConfirm: 'तुम्हाला हा लॉट नक्की हटवायचा आहे का?',
    },
    mandi: {
      title: 'मंडी भाव व किंमत सूचना',
      subtitle: 'महाराष्ट्रातील विविध कृषी उत्पन्न बाजार समित्यांचे आजचे अधिकृत किमान, कमाल व मोडल बाजारभाव.',
      govVerifiedBadge: 'अधिकृत सरकारी आकडेवारी (AGMARKNET)',
      refreshBtn: 'ताजे दर आणा',
      livePricesTab: 'थेट बाजारभाव (Live Prices)',
      alertsTab: 'माझ्या किंमत सूचना व वॉचलिस्ट',
      allDistricts: 'सर्व जिल्हे (All Districts)',
      searchPlaceholder: 'मंडी नाव शोधा...',
      voiceSearchTooltip: 'मंडी नाव बोला',
      modalPrice: 'मोडल दर (Modal Price):',
      minPrice: 'किमान दर:',
      maxPrice: 'कमाल दर:',
      arrivals: 'आजची आवक (Arrivals):',
      arrivalDate: 'तारीख:',
      yourCrop: 'तुमचे पीक',
      setAlertBtn: 'सूचना लावा',
      addAlertTitle: 'नवीन किंमत सूचना लावा',
      addAlertSubtitle: 'दर ठरवलेल्या पातळीवर आल्यावर सूचना प्राप्त करा',
      targetRateLabel: 'लक्ष्य दर (₹/क्विंटल) *',
      conditionLabel: 'अट / Condition',
      above: 'दर यापेक्षा जास्त (≥)',
      below: 'दर यापेक्षा कमी (≤)',
      saveAlert: 'सूचना सेव्ह करा',
      noPricesFound: 'निवडलेल्या निकषांसाठी कोणताही बाजारभाव उपलब्ध नाही.',
      activeAlertsTitle: 'सक्रिय किंमत सूचना (Active Price Watchlist)',
      activeAlertsSubtitle: 'बाजारभाव तुमच्या ठरवलेल्या दरावर पोहोचल्यास येथे तात्काळ इशारा दिसेल.',
      noAlertsFound: 'कोणतीही किंमत सूचना लावलेली नाही',
      noAlertsDesc: 'आपल्या शेतीमालाला चांगला भाव मिळवण्यासाठी लक्ष्य दर ठरवा. भाव वाढताच तुम्हाला कळवले जाईल.',
      createFirstAlert: 'पहिली सूचना तयार करा',
    },
    recommendations: {
      title: 'शेतमाल विक्री शिफारशी (Selling Recommendations)',
      subtitle: 'आपल्या पिकासाठी आणि उपलब्ध परिमाणासाठी सर्वाधिक नफा देणारी बाजारपेठ शोधा.',
      bestMarketTitle: 'सर्वोत्तम शिफारस केलेली बाजार समिती',
      highestPriceLabel: 'सर्वोच्च मोडल दर',
      extraGainLabel: 'अंदाजे संभाव्य अतिरिक्त नफा',
      rankLabel: 'क्रमांक',
      reasoningTitle: 'शिफारस विश्लेषण व कारणे',
      marketName: 'बाजार समिती',
      difference: 'फरक प्रति क्विंटल',
      calculateForQuantity: 'उपलब्ध परिमाणासाठी तुलना',
      noRecommendations: 'सध्या या पिकासाठी तुलनात्मक शिफारशी उपलब्ध नाहीत.',
      badgeAdvisor: 'डेटा-आधारित विक्री सल्लागार (Selling Advisor)',
      commodityLabel: 'शेतमाल / पीक',
      quantityLabel: 'उपलब्ध माल (क्विंटल)',
      varietyLabel: 'जात / Variety',
      findBestRateBtn: 'योग्य भाव शोधा',
      selectHarvestLot: 'उपलब्ध शेतमाल लॉट निवडा (Select Harvest Lot)',
      useExistingLot: 'नोंदवलेला शेतमाल वापरा',
      manualExplore: 'इतर पीक शोधा (Explore Any Crop)',
      noLotsFound: 'कोणताही शेतमाल लॉट सापडला नाही',
      noLotsDesc: 'थेट अचूक शिफारशी मिळवण्यासाठी शेतमाल लॉट जोडा किंवा खालील फॉर्म वापरा.',
      bestPriceBadge: 'सर्वोत्तम नोंदवलेला भाव',
      convenientLocalBadge: 'सोयीस्कर स्थानिक बाजार',
      bestOverallBadge: 'सर्वोत्तम संतुलित निवड',
      sortBy: 'क्रमवारी (Sort By)',
      sortByPrice: 'सर्वोच्च दर (Highest Rate)',
      sortByLocation: 'माझा जिल्हा प्रथम (Home District)',
      sortByDate: 'नवीनतम दर (Latest Date)',
      sellAtThisMandi: 'या मंडीमध्ये विक्री नोंदवा',
      grossRealization: 'अंदाजे एकूण उत्पन्न (Gross Payout)',
      grossRange: 'अंदाजे उत्पन्न श्रेणी',
      disclaimerNotice: 'मोडल भाव हा AGMARKNET / MSAMB चा अधिकृत संदर्भ दर आहे, अंतिम व्यापारी हमी नाही. प्रत्यक्ष निव्वळ रक्कम अधिकृत कपातीनंतर ठरते.',
    },
    transactions: {
      title: 'शेतीमाल विक्री नोंदी (Sale Records)',
      subtitle: 'तोल पावती, व्यापारी व्यवहार, अधिकृत कपाती आणि थकीत हिशोबांचे अचूक व्यवस्थापन.',
      newSaleBtn: 'नवीन विक्री नोंदवा',
      recordPaymentBtn: 'पेमेंट नोंदवा',
      grossAmount: 'एकूण रक्कम (Gross)',
      netReceivable: 'निव्वळ येणे बाकी (Net)',
      totalDeductions: 'एकूण कपाती (Deductions)',
      receivedAmount: 'जमा झालेली रक्कम',
      outstandingAmount: 'थकबाकी / येणे बाकी',
      allRecords: 'सर्व नोंदी (Transaction History)',
      searchPlaceholder: 'व्यापारी किंवा पीक शोधा...',
      voiceSearchTooltip: 'शोधण्यासाठी बोला',
      trader: 'व्यापारी:',
      market: 'मंडी:',
      date: 'तारीख:',
      settled: 'पूर्ण निकाली (Settled)',
      partial: 'अंशतः प्राप्त (Partial)',
      pending: 'थकीत (Pending)',
      details: 'तपशील पहा',
      ratePerUnit: 'दर प्रति क्विंटल',
      deductionsBreakdown: 'पावतीमधील नोंदणीकृत कपाती (Deductions):',
      notes: 'शेरा / टीप:',
      evidenceAttached: 'काटा पावती संलग्न',
      videoEvidenceAttached: 'व्हिडिओ पुरावा संलग्न',
      receiptEvidenceAttached: 'पावती फोटो संलग्न',
      viewEvidence: 'पुरावा पहा (View)',
      voiceNote: 'ऑडिओ टीप (Voice Note):',
      noSalesTitle: 'कोणतीही विक्री नोंद सापडली नाही',
      noSalesDesc: 'आपल्या शेतीमालाची पहिली विक्री तोल पावती आणि कपातींसह नोंदवण्यासाठी वरील बटण दाबा.',
      filterNoResult: 'शोध निकषांनुसार कोणतीही नोंद सापडली नाही.',
    },
    payments: {
      title: 'जमा-खर्च व देणी (Payments & Receivables)',
      subtitle: 'व्यापाऱ्यांकडून मिळालेली रोख, UPI, धनादेश हप्त्यांची नोंद व एकूण बाकी रक्कम हिशोब.',
      recordPaymentBtn: 'पेमेंट नोंदवा (Record Payment)',
      totalReceived: 'एकूण मिळालेली रक्कम (Total Received)',
      pendingReceivables: 'एकूण बाकी रक्कम (Pending Receivables)',
      settlementRate: 'निकाली प्रमाण (Settlement Rate)',
      paymentHistory: 'हप्ते व भरणा इतिहास (Payment Receipts)',
      searchPlaceholder: 'संदर्भ, पावती किंवा विक्री ID...',
      amount: 'मिळालेली रक्कम (Amount in ₹)',
      paymentMode: 'पेमेंट पद्धत',
      cash: 'रोख (Cash)',
      upi: 'UPI / Online',
      cheque: 'धनादेश (Cheque)',
      bankTransfer: 'बँक ट्रान्सफर (NEFT/RTGS)',
      paymentDate: 'पेमेंट तारीख',
      referenceNote: 'संदर्भ / शेरा (Reference / Note)',
      linkedSale: 'संबंधित विक्री निवडा (Link to Sale)',
      noPaymentsTitle: 'कोणतीही पेमेंट नोंद सापडली नाही',
      noPaymentsDesc: 'व्यापाऱ्यांकडून मिळालेली रोख किंवा बँक रक्कम नोंदवण्यासाठी वरील बटण दाबा.',
      receivedBadge: 'जमा झाले (Received)',
      evidenceReceipt: 'पावती पुरावा',
      viewReceipt: 'पावती पहा',
    },
    profitCoach: {
      title: 'नफा सल्लागार व वित्तीय मार्गदर्शन (Profit Coach)',
      subtitle: 'थकीत येणे रक्कम वसुली, बाजारभाव तुलना आणि कपातीचे तांत्रिक लेखापरीक्षण.',
      debtorsTitle: 'थकबाकीदार व्यापारी प्राधान्य (Debtor Prioritization)',
      debtorsDesc: 'सर्वाधिक थकीत रक्कम व जुने व्यवहार असलेल्या व्यापाऱ्यांची वर्गवारी.',
      benchmarkTitle: 'बाजारभाव तुलनात्मक विश्लेषण (Mandi Benchmark Comparison)',
      benchmarkDesc: 'तुम्हाला मिळालेला सरासरी दर आणि अधिकृत बाजारभाव यांच्यातील तुलना.',
      auditTitle: 'कपात लेखापरीक्षण (Deductions Audit)',
      auditDesc: 'हमाली, तोल व सेस कपाती अधिकृत मर्यादेत आहेत का याची तपासणी.',
      daysOverdue: 'दिवस बाकी',
      riskHigh: 'उच्च जोखीम (High Risk)',
      riskMedium: 'मध्यम जोखीम (Medium)',
      riskLow: 'कमी जोखीम (Low)',
      realizedPrice: 'मिळालेला दर:',
      mandiBenchmark: 'मंडी बेंचमार्क:',
      priceGain: 'अधिक फायदा:',
      priceLag: 'नुकसान / कमी दर:',
      totalDeductionsPaid: 'भरलेली एकूण कपात:',
      actionAdvice: 'सल्लागार शिफारस:',
    },
    scanner: {
      title: 'काटा पावती / बिल कॅमेरा स्कॅनर',
      subtitle: 'कॅमेरा, फोटो किंवा व्हिडिओ पुरावा जोडून आपोआप अचूक विक्री नोंदवा',
      cameraTab: 'थेट कॅमेरा',
      uploadTab: 'फोटो अपलोड',
      videoTab: 'व्हिडिओ पुरावा',
      textTab: 'मजकूर',
      takePhoto: 'फोटो काढा (Take Photo)',
      rotate: 'फिरवा (Rotate 90°)',
      retake: 'पुन्हा काढा (Retake)',
      selectImage: 'काटा पावती किंवा बिलाचा फोटो निवडा',
      selectVideo: 'वजन काटा किंवा मालाचा छोटा व्हिडिओ पुरावा निवडा',
      textPlaceholder: 'उदा. बाजार समितीचे नाव, व्यापारी, शेतकरी, वजन आणि दर...',
      extractBtn: 'सर्वम AI ने वाचा (Scan)',
      reviewTitle: 'माहिती वाचली गेली (Review Draft)',
      confidence: 'विश्वसनीयता:',
      gross: 'एकूण रक्कम (Gross):',
      deductions: 'एकूण कपाती (Deductions):',
      net: 'निव्वळ येणे बाकी (Net):',
      draftNotice: 'हे तात्पुरते वाचन आहे. अधिकृत नोंदीसाठी खालील बटणावर क्लिक करून खात्री करा.',
      scanAgain: 'पुन्हा स्कॅन करा',
      confirmSale: 'विक्री म्हणून पुष्टी करा (Save Sale)',
      evidenceAttached: 'पावतीचा फोटो पुरावा संलग्न केला गेला आहे.',
      videoAttached: 'व्हिडिओ पुरावा संलग्न केला गेला आहे.',
    },
    assistant: {
      title: 'सर्वम AI कृषी सहाय्यक (Voice Assistant)',
      subtitle: 'मराठी, हिंदी व इंग्रजीत शेतीमाल भाव व आर्थिक हिशोब विचारा',
      inputPlaceholder: 'तुमचा प्रश्न विचारा किंवा आजचा कांदा भाव विचारा...',
      listening: 'ऐकत आहे... बोला',
      processing: 'विचार करत आहे...',
      speakBtn: 'बोला (Speak)',
      sendBtn: 'पाठवा (Send)',
      quickPromptsTitle: 'त्वरित प्रश्न (Quick Questions):',
      actionProposalTitle: 'कृती पुष्टीकरण (Action Confirmation):',
      confirmExecution: 'पुष्टी करा व अंमलात आणा (Confirm)',
      cancelExecution: 'रद्द करा (Cancel)',
      executing: 'कृती अंमलात आणत आहे...',
      executedSuccess: 'कृती यशस्वीरित्या पूर्ण झाली!',
      audioVoice: 'आवाज ऐका (Listen)',
    },
    profile: {
      title: 'शेतकरी प्रोफाईल',
      subtitle: 'आपली वैयक्तिक माहिती, गाव आणि भाषा प्राधान्ये तपासा किंवा बदला.',
      editProfile: 'माहिती सुधारा',
      saveChanges: 'बदल जतन करा',
      saving: 'जतन करत आहे...',
      updateSuccess: 'प्रोफाईल यशस्वीरित्या अद्यतनित केले!',
      memberSince: 'नोंदणी दिनांक',
      accountDetails: 'खाते तपशील',
      locationInfo: 'पत्ता व स्थान',
    },
    common: {
      maharashtra: 'महाराष्ट्र',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      loading: 'लोड होत आहे...',
      error: 'काहीतरी त्रुटी आली, कृपया पुन्हा प्रयत्न करा.',
      phaseNotice: 'विकास सुरू आहे',
      phaseNoticeDesc: 'या मॉड्यूलचे विकास कार्य पुढील टप्प्यात (Phase 2) केले जाईल.',
      backToDashboard: 'डॅशबोर्डवर परत जा',
      retry: 'पुन्हा प्रयत्न करा',
      close: 'बंद करा',
      delete: 'हटवा',
      edit: 'सुधारा',
      confirm: 'खात्री करा',
      optional: 'ऐच्छिक',
      required: 'आवश्यक',
      success: 'यशस्वी',
    },
  },

  'hi-IN': {
    appName: 'मंडीमित्र',
    tagline: 'किसान मंडी व वित्तीय बुद्धिमत्ता मंच',
    nav: {
      dashboard: 'डैशबोर्ड',
      mandiIntelligence: 'मंडी भाव',
      sellingRecommendations: 'बिक्री सलाह',
      transactions: 'बिक्री रिकॉर्ड',
      payments: 'भुगतान व बकाया',
      profitCoach: 'मुनाफा सलाहकार',
      sarvamAssistant: 'सर्वम AI सहायक',
      profile: 'मेरा प्रोफाइल',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      register: 'पंजीकरण करें',
    },
    auth: {
      welcomeBack: 'स्वागत है',
      loginTitle: 'मंडीमित्र में लॉगिन करें',
      loginSubtitle: 'अपनी फसल के सही दाम और सटीक हिसाब-किताब',
      registerTitle: 'किसान नया पंजीकरण',
      registerSubtitle: 'अपनी स्थानीय मंडी और बाज़ार भावों से सीधे जुड़ें',
      username: 'यूज़रनेम (Username)',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      displayName: 'पूरा नाम',
      phoneNumber: 'मोबाइल नंबर',
      optional: 'वैकल्पिक',
      state: 'राज्य',
      district: 'ज़िला',
      village: 'गाँव / कस्बा',
      locality: 'पता / क्षेत्र',
      preferredLanguage: 'पसंदीदा भाषा',
      submitLogin: 'लॉगिन करें',
      submitRegister: 'पंजीकरण पूरा करें',
      noAccount: 'नया खाता बनाना है? यहाँ पंजीकरण करें',
      haveAccount: 'पहले से खाता है? यहाँ लॉगिन करें',
      loggingIn: 'लॉगिन हो रहा है...',
      registering: 'पंजीकरण हो रहा है...',
      loginSuccess: 'सफलतापूर्वक लॉगिन हो गया!',
      registerSuccess: 'पंजीकरण सफल रहा!',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते।',
    },
    dashboard: {
      welcome: 'नमस्ते,',
      overviewSubtitle: 'अपनी कृषि उपज के वास्तविक बाजार भाव और वित्तीय विवरण की निगरानी करें।',
      locationBadge: 'पंजीकृत गाँव',
      platformBanner: 'महाराष्ट्र किसान मंच',
      verifiedDataNotice: 'AGMARKNET प्रत्यक्ष भाव सत्यापन',
      askSarvamVoiceBtn: 'बोलकर पूछें / Ask Sarvam AI',
      recordSaleBtn: 'नई बिक्री दर्ज करें',
      recordSaleSubtitle: 'तौल पर्ची व कटौती सहित',
      scanBillBtn: 'तौल पर्ची स्कैन करें',
      scanBillSubtitle: 'AI कैमरा पर्ची वाचक',
      profitCoachBtn: 'मुनाफा सलाहकार',
      profitCoachSubtitle: 'बकाया व दर विश्लेषण',
      recentTransactions: 'हालिया लेनदेन',
      viewAllRecords: 'सभी रिकॉर्ड देखें',
      noRecentTransactions: 'अभी तक कोई बिक्री दर्ज नहीं हुई है।',
      firstSaleAction: 'पहली बिक्री दर्ज करें',
      traderLabel: 'व्यापारी:',
      grossLabel: 'कुल राशि:',
      netLabel: 'शुद्ध देय:',
      outstandingLabel: 'बकाया:',
      settledLabel: 'पूर्ण चुकता',
      partialLabel: 'आंशिक प्राप्त',
      pendingLabel: 'लंबित',
      cardMandi: {
        title: 'मंडी भाव विश्लेषण',
        desc: 'सरकारी पंजीकृत मंडियों के न्यूनतम, अधिकतम और मॉडल भाव देखें।',
        action: 'भाव देखें',
      },
      cardRecommendations: {
        title: 'उपज बिक्री सलाहकार',
        desc: 'अपनी उपज के लिए सबसे बेहतर और लाभदायक मंडी का चयन करें।',
        action: 'सलाह लें',
      },
      cardTransactions: {
        title: 'फसल बिक्री विवरण',
        desc: 'व्यापारी, तौल पर्ची, हम्माली व कटौती का हिसाब सुरक्षित रखें।',
        action: 'रिकॉर्ड देखें',
      },
      cardPayments: {
        title: 'बकाया राशि व भुगतान',
        desc: 'व्यापारियों से मिलने वाली बकाया राशि और किस्तों का लेखा-जोखा।',
        action: 'भुगतान जांचें',
      },
      cardSarvam: {
        title: 'सर्वम AI कृषक सहायक',
        desc: 'अपनी भाषा में बोलकर या रसीद दिखाकर हिसाब और बाज़ार की जानकारी पाएं।',
        action: 'AI से बात करें',
      },
    },
    harvest: {
      title: 'फसल कटाई व उपज स्टॉक (Harvest Records)',
      subtitle: 'फसल की कटाई दर्ज करें और उससे सीधे बिक्री लॉट तैयार करें।',
      addHarvestBtn: '+ नई उपज दर्ज करें',
      createLotBtn: 'बिक्री लॉट बनाएं',
      cropLabel: 'फसल / उपज',
      selectCropPrompt: '-- फसल चुनें --',
      noCropsAlert: 'आपकी प्रोफाइल में अभी फसलें दर्ज नहीं हैं।',
      addCropToProfile: 'प्रोफाइल में फसल जोड़ें',
      harvestDateLabel: 'कटाई की तारीख',
      qtyLabel: 'काटी गई मात्रा (क्विंटल)',
      remainingLabel: 'शेष कटाई स्टॉक',
      totalHarvested: 'कुल कटाई',
      unitLabel: 'इकाई (Unit)',
      gradeLabel: 'गुणवत्ता / ग्रेड',
      storageLabel: 'भंडारण स्थान / गोदाम',
      notesLabel: 'टिप्पणी / विवरण',
      saving: 'सुरक्षित हो रहा है...',
      saveSuccess: 'उपज सफलतापूर्वक दर्ज हो गई!',
      emptyTitle: 'कोई कटाई रिकॉर्ड नहीं मिला',
      emptyDesc: 'काटी गई फसल यहाँ दर्ज करें, ताकि बिक्री करते समय स्टॉक अपने आप अपडेट हो सके।',
      statusAvailable: 'उपलब्ध',
      statusPartial: 'आंशिक बिक्री',
      statusSold: 'पूरा बिका',
      createLotTitle: 'कटाई स्टॉक से बिक्री लॉट बनाएं',
      createLotDesc: 'इस कटाई में से मंडी में बेचने के लिए उपलब्ध मात्रा तय करें।',
      lotQtyLabel: 'बिक्री लॉट मात्रा (क्विंटल)',
      expectedRateLabel: 'अपेक्षित दर (₹/क्विंटल - वैकल्पिक)',
      oversellWarning: 'लॉट मात्रा शेष कटाई स्टॉक से अधिक नहीं हो सकती।',
      convertSuccess: 'बिक्री लॉट सफलतापूर्वक बन गया!',
      cancelBtn: 'रद्द करें',
      saveBtn: 'उपज सुरक्षित करें',
      deleteConfirm: 'क्या आप इस उपज रिकॉर्ड को हटाना चाहते हैं?',
    },
    lots: {
      title: 'उपलब्ध उपज लॉट्स (Produce Lots)',
      subtitle: 'अपनी कुल उपज, बिकी हुई मात्रा और उपलब्ध स्टॉक प्रबंधित करें।',
      addLotBtn: '+ नया लॉट जोड़ें',
      available: 'उपलब्ध स्टॉक',
      sold: 'बिका हुआ',
      total: 'कुल उपज',
      emptyTitle: 'कोई उपज लॉट नहीं मिला',
      emptyDesc: 'अपनी उपज जोड़ें ताकि बिक्री दर्ज करते समय स्टॉक अपने आप अपडेट हो सके।',
      createModalTitle: 'नया उपज लॉट जोड़ें',
      statusAvailable: 'उपलब्ध',
      statusPartial: 'आंशिक बिका',
      statusSold: 'पूरा बिका',
      cancelBtn: 'रद्द करें',
      saveBtn: 'लॉट सुरक्षित करें',
      deleteConfirm: 'क्या आप इस लॉट को हटाना चाहते हैं?',
    },
    mandi: {
      title: 'मंडी भाव व मूल्य सूचना',
      subtitle: 'महाराष्ट्र की विभिन्न कृषि उपज मंडियों के आज के आधिकारिक न्यूनतम, अधिकतम व मॉडल भाव।',
      govVerifiedBadge: 'सत्यापित सरकारी आंकड़े (AGMARKNET)',
      refreshBtn: 'ताज़ा भाव लाएं',
      livePricesTab: 'लाइव मंडी भाव (Live Prices)',
      alertsTab: 'मेरी मूल्य सूचनाएं व वॉचलिस्ट',
      allDistricts: 'सभी जिले (All Districts)',
      searchPlaceholder: 'मंडी का नाम खोजें...',
      voiceSearchTooltip: 'मंडी का नाम बोलें',
      modalPrice: 'मॉडल भाव (Modal Price):',
      minPrice: 'न्यूनतम भाव:',
      maxPrice: 'अधिकतम भाव:',
      arrivals: 'आज की आवक (Arrivals):',
      arrivalDate: 'तारीख:',
      yourCrop: 'आपकी फसल',
      setAlertBtn: 'अलर्ट लगाएं',
      addAlertTitle: 'नया मूल्य अलर्ट सेट करें',
      addAlertSubtitle: 'भाव लक्षित स्तर पर पहुंचने पर तुरंत सूचना पाएं',
      targetRateLabel: 'लक्षित भाव (₹/क्विंटल) *',
      conditionLabel: 'शर्त / Condition',
      above: 'भाव इससे अधिक (≥)',
      below: 'भाव इससे कम (≤)',
      saveAlert: 'अलर्ट सुरक्षित करें',
      noPricesFound: 'चुने गए विकल्पों के लिए कोई मंडी भाव उपलब्ध नहीं है।',
      activeAlertsTitle: 'सक्रिय मूल्य सूचनाएं (Active Price Watchlist)',
      activeAlertsSubtitle: 'मंडी भाव आपके लक्षित स्तर पर पहुंचते ही यहाँ संकेत दिखेगा।',
      noAlertsFound: 'कोई मूल्य अलर्ट सेट नहीं किया गया है',
      noAlertsDesc: 'अपनी फसल के बेहतर दाम पाने के लिए लक्ष्य भाव तय करें। भाव बढ़ते ही आपको सूचित किया जाएगा।',
      createFirstAlert: 'पहला अलर्ट बनाएं',
    },
    recommendations: {
      title: 'उपज बिक्री सिफारिशें (Selling Recommendations)',
      subtitle: 'अपनी फसल व मात्रा के लिए सबसे अधिक मुनाफा देने वाली उपयुक्त मंडी चुनें।',
      bestMarketTitle: 'सर्वोत्तम अनुशंसित कृषि मंडी',
      highestPriceLabel: 'सर्वोच्च मॉडल भाव',
      extraGainLabel: 'अनुमानित संभावित अतिरिक्त लाभ',
      rankLabel: 'रैंक',
      reasoningTitle: 'सिफारिश विश्लेषण व कारण',
      marketName: 'मंडी का नाम',
      difference: 'अंतर प्रति क्विंटल',
      calculateForQuantity: 'उपलब्ध मात्रा के आधार पर तुलना',
      noRecommendations: 'फिलहाल इस फसल के लिए तुलनात्मक सिफारिश उपलब्ध नहीं है।',
      badgeAdvisor: 'डेटा-आधारित बिक्री सलाहकार (Selling Advisor)',
      commodityLabel: 'फसल / उपज',
      quantityLabel: 'उपलब्ध मात्रा (क्विंटल)',
      varietyLabel: 'किस्म / Variety',
      findBestRateBtn: 'उपयुक्त भाव खोजें',
      selectHarvestLot: 'उपलब्ध फसल लॉट चुनें (Select Harvest Lot)',
      useExistingLot: 'दर्ज फसल लॉट का उपयोग करें',
      manualExplore: 'अन्य फसल खोजें (Explore Any Crop)',
      noLotsFound: 'कोई फसल लॉट नहीं मिला',
      noLotsDesc: 'सटीक सिफारिशों के लिए फसल लॉट जोड़ें या नीचे दिए गए फॉर्म का उपयोग करें।',
      bestPriceBadge: 'सर्वोत्तम दर्ज भाव',
      convenientLocalBadge: 'सुविधाजनक स्थानीय मंडी',
      bestOverallBadge: 'सर्वश्रेष्ठ संतुलित विकल्प',
      sortBy: 'क्रमबद्ध करें (Sort By)',
      sortByPrice: 'सर्वोच्च भाव (Highest Rate)',
      sortByLocation: 'मेरा जिला पहले (Home District)',
      sortByDate: 'नवीनतम भाव (Latest Date)',
      sellAtThisMandi: 'इस मंडी में बिक्री दर्ज करें',
      grossRealization: 'अनुमानित सकल भुगतान (Gross Payout)',
      grossRange: 'अनुमानित भुगतान दायरा',
      disclaimerNotice: 'मॉडल भाव AGMARKNET / MSAMB का आधिकारिक संदर्भ दर है, कोई व्यापारी गारंटी नहीं। वास्तविक शुद्ध राशि स्वीकृत कटौतियों के बाद तय होती है।',
    },
    transactions: {
      title: 'फसल बिक्री विवरण (Sale Records)',
      subtitle: 'तौल पर्ची, व्यापारी लेनदेन, आधिकारिक कटौतियां और बकाया हिसाब का प्रबंधन।',
      newSaleBtn: 'नई बिक्री दर्ज करें',
      recordPaymentBtn: 'भुगतान दर्ज करें',
      grossAmount: 'कुल राशि (Gross)',
      netReceivable: 'शुद्ध देय राशि (Net)',
      totalDeductions: 'कुल कटौतियां (Deductions)',
      receivedAmount: 'प्राप्त राशि',
      outstandingAmount: 'बकाया राशि',
      allRecords: 'सभी लेनदेन रिकॉर्ड (Transaction History)',
      searchPlaceholder: 'व्यापारी या फसल खोजें...',
      voiceSearchTooltip: 'खोजने के लिए बोलें',
      trader: 'व्यापारी:',
      market: 'मंडी:',
      date: 'तारीख:',
      settled: 'पूर्ण चुकता (Settled)',
      partial: 'आंशिक प्राप्त (Partial)',
      pending: 'लंबित (Pending)',
      details: 'विवरण देखें',
      ratePerUnit: 'भाव प्रति क्विंटल',
      deductionsBreakdown: 'पर्ची में दर्ज कटौतियां (Deductions):',
      notes: 'टिप्पणी / विवरण:',
      evidenceAttached: 'तौल पर्ची संलग्न',
      videoEvidenceAttached: 'वीडियो साक्ष्य संलग्न',
      receiptEvidenceAttached: 'रसीद फोटो संलग्न',
      viewEvidence: 'साक्ष्य देखें (View)',
      voiceNote: 'ऑडियो नोट (Voice Note):',
      noSalesTitle: 'कोई बिक्री रिकॉर्ड नहीं मिला',
      noSalesDesc: 'अपनी कृषि उपज की पहली बिक्री तौल पर्ची और कटौतियों के साथ दर्ज करने के लिए ऊपर का बटन दबाएं।',
      filterNoResult: 'खोजे गए शब्दों के लिए कोई रिकॉर्ड नहीं मिला।',
    },
    payments: {
      title: 'भुगतान व बकाया विवरण (Payments & Receivables)',
      subtitle: 'व्यापारियों से प्राप्त नकद, UPI, चेक की किस्तों का विवरण और कुल बकाया राशि।',
      recordPaymentBtn: 'भुगतान दर्ज करें (Record Payment)',
      totalReceived: 'कुल प्राप्त राशि (Total Received)',
      pendingReceivables: 'कुल बकाया राशि (Pending Receivables)',
      settlementRate: 'निपटान दर (Settlement Rate)',
      paymentHistory: 'किस्त व रसीद इतिहास (Payment Receipts)',
      searchPlaceholder: 'संदर्भ, रसीद या बिक्री ID...',
      amount: 'प्राप्त राशि (Amount in ₹)',
      paymentMode: 'भुगतान का प्रकार',
      cash: 'नकद (Cash)',
      upi: 'UPI / Online',
      cheque: 'चेक (Cheque)',
      bankTransfer: 'बैंक ट्रांसफर (NEFT/RTGS)',
      paymentDate: 'भुगतान तिथि',
      referenceNote: 'संदर्भ / शेरा (Reference / Note)',
      linkedSale: 'संबंधित बिक्री चुनें (Link to Sale)',
      noPaymentsTitle: 'कोई भुगतान रिकॉर्ड नहीं मिला',
      noPaymentsDesc: 'व्यापारियों से प्राप्त नकद या बैंक भुगतान दर्ज करने के लिए ऊपर का बटन दबाएं।',
      receivedBadge: 'प्राप्त हुआ (Received)',
      evidenceReceipt: 'रसीद साक्ष्य',
      viewReceipt: 'रसीद देखें',
    },
    profitCoach: {
      title: 'मुनाफा सलाहकार व वित्तीय विश्लेषण (Profit Coach)',
      subtitle: 'बकाया वसूली प्राथमिकता, मंडी भाव तुलना और कटौतियों का पारदर्शी ऑडिट।',
      debtorsTitle: 'बकायादार व्यापारी प्राथमिकता (Debtor Prioritization)',
      debtorsDesc: 'सबसे अधिक बकाया राशि और पुराने लेनदेन वाले व्यापारियों का वर्गीकरण।',
      benchmarkTitle: 'मंडी बेंचमार्क भाव तुलना (Mandi Benchmark Comparison)',
      benchmarkDesc: 'आपको मिले औसत भाव और आधिकारिक मंडी भाव के बीच तुलना।',
      auditTitle: 'कटौती ऑडिट (Deductions Audit)',
      auditDesc: 'हम्माली, तुलाई व सेस कटौतियां आधिकारिक सीमा में हैं या नहीं इसकी जांच।',
      daysOverdue: 'दिन से लंबित',
      riskHigh: 'उच्च जोखिम (High Risk)',
      riskMedium: 'मध्यम जोखिम (Medium)',
      riskLow: 'कम जोखिम (Low)',
      realizedPrice: 'मिला भाव:',
      mandiBenchmark: 'मंडी बेंचमार्क:',
      priceGain: 'अतिरिक्त लाभ:',
      priceLag: 'नुकसान / कम भाव:',
      totalDeductionsPaid: 'कुल दी गई कटौती:',
      actionAdvice: 'सलाहकार सिफारिश:',
    },
    scanner: {
      title: 'तौल पर्ची / बिल कैमरा स्कैनर',
      subtitle: 'कैमरा, फोटो या वीडियो साक्ष्य जोड़कर स्वचालित रूप से सही बिक्री दर्ज करें',
      cameraTab: 'लाइव कैमरा',
      uploadTab: 'फोटो अपलोड',
      videoTab: 'वीडियो साक्ष्य',
      textTab: 'टेक्स्ट',
      takePhoto: 'फोटो खींचे (Take Photo)',
      rotate: 'घुमाएं (Rotate 90°)',
      retake: 'दोबारा लें (Retake)',
      selectImage: 'तौल पर्ची या बिल का फोटो चुनें',
      selectVideo: 'कांटा या उपज का छोटा वीडियो साक्ष्य चुनें',
      textPlaceholder: 'उदा. मंडी का नाम, व्यापारी, किसान, वजन और दर...',
      extractBtn: 'सर्वम AI से पढ़ें (Scan)',
      reviewTitle: 'जानकारी पढ़ी गई (Review Draft)',
      confidence: 'विश्वसनीयता:',
      gross: 'कुल राशि (Gross):',
      deductions: 'कुल कटौतियां (Deductions):',
      net: 'शुद्ध देय राशि (Net):',
      draftNotice: 'यह अस्थाई वाचन है। आधिकारिक प्रविष्टि के लिए नीचे दिए बटन पर क्लिक करें।',
      scanAgain: 'दोबारा स्कैन करें',
      confirmSale: 'बिक्री के रूप में सुरक्षित करें (Save Sale)',
      evidenceAttached: 'पर्ची का फोटो साक्ष्य संलग्न किया गया है।',
      videoAttached: 'वीडियो साक्ष्य संलग्न किया गया है।',
    },
    assistant: {
      title: 'सर्वम AI कृषक सहायक (Voice Assistant)',
      subtitle: 'मराठी, हिंदी व अंग्रेजी में फसल भाव और वित्तीय हिसाब-किताब पूछें',
      inputPlaceholder: 'अपना सवाल पूछें या आज का प्याज भाव जानें...',
      listening: 'सुन रहा है... बोलिए',
      processing: 'सोच रहा है...',
      speakBtn: 'बोलें (Speak)',
      sendBtn: 'भेजें (Send)',
      quickPromptsTitle: 'त्वरित प्रश्न (Quick Questions):',
      actionProposalTitle: 'कार्यवाही पुष्टि (Action Confirmation):',
      confirmExecution: 'पुष्टि करें और निष्पादित करें (Confirm)',
      cancelExecution: 'रद्द करें (Cancel)',
      executing: 'कार्यवाही निष्पादित हो रही है...',
      executedSuccess: 'कार्यवाही सफलतापूर्वक पूरी हुई!',
      audioVoice: 'आवाज सुनें (Listen)',
    },
    profile: {
      title: 'किसान प्रोफाइल',
      subtitle: 'अपनी व्यक्तिगत जानकारी, गाँव और भाषा प्राथमिकताएं बदलें।',
      editProfile: 'जानकारी बदलें',
      saveChanges: 'बदलाव सुरक्षित करें',
      saving: 'सुरक्षित हो रहा है...',
      updateSuccess: 'प्रोफाइल सफलतापूर्वक अपडेट हुआ!',
      memberSince: 'पंजीकरण तिथि',
      accountDetails: 'खाता विवरण',
      locationInfo: 'स्थान विवरण',
    },
    common: {
      maharashtra: 'महाराष्ट्र',
      save: 'सुरक्षित करें',
      cancel: 'रद्द करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि हुई, कृपया पुन: प्रयास करें।',
      phaseNotice: 'कार्य प्रगति पर है',
      phaseNoticeDesc: 'इस सुविधा को आगामी चरण (Phase 2) में शुरू किया जाएगा।',
      backToDashboard: 'डैशबोर्ड पर वापस जाएं',
      retry: 'पुन: प्रयास करें',
      close: 'बंद करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      confirm: 'पुष्टि करें',
      optional: 'वैकल्पिक',
      required: 'आवश्यक',
      success: 'सफल',
    },
  },

  'en-IN': {
    appName: 'MANDIMITRA',
    tagline: 'Agricultural Market & Financial Intelligence Platform',
    nav: {
      dashboard: 'Dashboard',
      mandiIntelligence: 'Mandi Prices',
      sellingRecommendations: 'Selling Advice',
      transactions: 'Sale Records',
      payments: 'Payments & Receivables',
      profitCoach: 'Profit Coach',
      sarvamAssistant: 'Sarvam AI Assistant',
      profile: 'My Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginTitle: 'Login to MANDIMITRA',
      loginSubtitle: 'Real reported mandi intelligence and transparent sale tracking',
      registerTitle: 'Farmer Registration',
      registerSubtitle: 'Connect to verified government mandi prices and financial tools',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      displayName: 'Full Name',
      phoneNumber: 'Mobile Phone Number',
      optional: 'Optional',
      state: 'State',
      district: 'District',
      village: 'Village / Town',
      locality: 'Locality / Landmark',
      preferredLanguage: 'Preferred Language',
      submitLogin: 'Login to Account',
      submitRegister: 'Complete Registration',
      noAccount: "Don't have an account? Register here",
      haveAccount: 'Already have an account? Login here',
      loggingIn: 'Signing in...',
      registering: 'Creating account...',
      loginSuccess: 'Logged in successfully!',
      registerSuccess: 'Registration successful!',
      passwordMismatch: 'Passwords do not match.',
    },
    dashboard: {
      welcome: 'Welcome,',
      overviewSubtitle: 'Monitor verified market intelligence and agricultural financial transactions.',
      locationBadge: 'Registered Village',
      platformBanner: 'Maharashtra Farmers Forum',
      verifiedDataNotice: 'AGMARKNET Direct Price Verification',
      askSarvamVoiceBtn: 'Speak to Ask / Ask Sarvam AI',
      recordSaleBtn: 'Record New Sale',
      recordSaleSubtitle: 'With weighing slip & deductions',
      scanBillBtn: 'Scan Weighing Slip',
      scanBillSubtitle: 'AI Camera Slip Reader',
      profitCoachBtn: 'Profit Coach',
      profitCoachSubtitle: 'Receivables & price benchmark',
      recentTransactions: 'Recent Transactions',
      viewAllRecords: 'View All Records',
      noRecentTransactions: 'No sale transactions recorded yet.',
      firstSaleAction: 'Record First Sale',
      traderLabel: 'Trader:',
      grossLabel: 'Gross Amount:',
      netLabel: 'Net Payable:',
      outstandingLabel: 'Outstanding:',
      settledLabel: 'Settled',
      partialLabel: 'Partial',
      pendingLabel: 'Pending',
      cardMandi: {
        title: 'Mandi Intelligence',
        desc: 'Actual government-reported mandi rates, commodity arrivals, and modal prices across Maharashtra.',
        action: 'Explore Mandi Prices',
      },
      cardRecommendations: {
        title: 'Selling Recommendations',
        desc: 'Data-driven market selection comparing modal rates across accessible mandis for your harvest.',
        action: 'Get Recommendations',
      },
      cardTransactions: {
        title: 'Transaction Records',
        desc: 'Track sales, commission cuts, weighing slip deductions, and trader receipts.',
        action: 'View Sale Records',
      },
      cardPayments: {
        title: 'Payments & Receivables',
        desc: 'Monitor installments, track outstanding receivables, and settlement histories.',
        action: 'Track Balances',
      },
      cardSarvam: {
        title: 'Sarvam AI Financial Coach',
        desc: 'Indic voice reasoning and document OCR for weighing slips in Marathi, Hindi & English.',
        action: 'Consult Sarvam AI',
      },
    },
    harvest: {
      title: 'Harvest & Produce Inventory (Harvest Records)',
      subtitle: 'Record freshly harvested produce and directly convert quantities into selling lots.',
      addHarvestBtn: '+ Record Harvest',
      createLotBtn: 'Create Selling Lot',
      cropLabel: 'Crop / Commodity',
      selectCropPrompt: '-- Select Crop --',
      noCropsAlert: 'No commonly grown crops registered in your profile yet.',
      addCropToProfile: 'Add Crops in Profile',
      harvestDateLabel: 'Harvest Date',
      qtyLabel: 'Harvested Quantity (Quintals)',
      remainingLabel: 'Remaining Harvested Stock',
      totalHarvested: 'Total Harvested',
      unitLabel: 'Unit',
      gradeLabel: 'Quality Grade',
      storageLabel: 'Storage Location / Godown',
      notesLabel: 'Notes / Remarks',
      saving: 'Saving...',
      saveSuccess: 'Harvest record saved successfully!',
      emptyTitle: 'No Harvest Records Found',
      emptyDesc: 'Record your harvested crops here so inventory is automatically tracked and deducted when sales occur.',
      statusAvailable: 'Available',
      statusPartial: 'Partially Sold',
      statusSold: 'Sold Out',
      createLotTitle: 'Create Selling Lot from Harvest Stock',
      createLotDesc: 'Allocate a portion of this harvest to make available for mandi sale.',
      lotQtyLabel: 'Selling Lot Quantity (Quintals)',
      expectedRateLabel: 'Expected Price (₹/Quintal - Optional)',
      oversellWarning: 'Lot quantity cannot exceed remaining harvested stock.',
      convertSuccess: 'Selling lot created successfully!',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Harvest',
      deleteConfirm: 'Are you sure you want to delete this harvest record?',
    },
    lots: {
      title: 'Available Produce Lots (Produce Lots)',
      subtitle: 'Track available harvest produce, partial sales, and remaining stock.',
      addLotBtn: '+ Add Harvest Lot',
      available: 'Available Stock',
      sold: 'Sold',
      total: 'Total Harvest',
      emptyTitle: 'No Harvest Lots Recorded',
      emptyDesc: 'Add your harvested lots so recorded sales automatically deduct from inventory.',
      createModalTitle: 'Register New Harvest Lot',
      statusAvailable: 'Available',
      statusPartial: 'Partially Sold',
      statusSold: 'Sold Out',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Lot',
      deleteConfirm: 'Are you sure you want to delete this lot?',
    },
    mandi: {
      title: 'Mandi Intelligence & Price Watchlist',
      subtitle: 'Official minimum, maximum, and modal market prices from APMCs across Maharashtra.',
      govVerifiedBadge: 'Government Verified (AGMARKNET)',
      refreshBtn: 'Refresh Prices',
      livePricesTab: 'Live Mandi Prices',
      alertsTab: 'My Price Alerts & Watchlist',
      allDistricts: 'All Districts',
      searchPlaceholder: 'Search mandi or market...',
      voiceSearchTooltip: 'Speak mandi name',
      modalPrice: 'Modal Price:',
      minPrice: 'Min Price:',
      maxPrice: 'Max Price:',
      arrivals: 'Daily Arrivals:',
      arrivalDate: 'Date:',
      yourCrop: 'Your Crop',
      setAlertBtn: 'Set Alert',
      addAlertTitle: 'Set Mandi Price Alert',
      addAlertSubtitle: 'Receive alerts when prices reach your targeted threshold',
      targetRateLabel: 'Target Rate (₹/Quintal) *',
      conditionLabel: 'Condition',
      above: 'Price is above or equal (≥)',
      below: 'Price is below or equal (≤)',
      saveAlert: 'Save Alert',
      noPricesFound: 'No mandi prices available for the selected criteria.',
      activeAlertsTitle: 'Active Price Watchlist',
      activeAlertsSubtitle: 'You will see alerts here when market prices reach your threshold.',
      noAlertsFound: 'No price alerts set yet',
      noAlertsDesc: 'Set a target rate for your crops to capture favorable selling opportunities.',
      createFirstAlert: 'Create First Alert',
    },
    recommendations: {
      title: 'Selling Recommendations',
      subtitle: 'Discover which regional market offers the highest modal price for your harvest.',
      bestMarketTitle: 'Top Recommended Mandi',
      highestPriceLabel: 'Highest Modal Price',
      extraGainLabel: 'Potential Extra Gain',
      rankLabel: 'Rank',
      reasoningTitle: 'Recommendation Reasoning',
      marketName: 'Market Name',
      difference: 'Difference per Quintal',
      calculateForQuantity: 'Compared for available quantity',
      noRecommendations: 'No selling recommendations currently available for this crop.',
      badgeAdvisor: 'Data-driven Selling Advisor',
      commodityLabel: 'Commodity / Crop',
      quantityLabel: 'Available Produce (Quintals)',
      varietyLabel: 'Variety',
      findBestRateBtn: 'Find Best Rate',
      selectHarvestLot: 'Select Your Harvest Lot',
      useExistingLot: 'Use Saved Harvest Lot',
      manualExplore: 'Explore Other Crop',
      noLotsFound: 'No Harvest Lots Found',
      noLotsDesc: 'Add a harvest produce lot for personalized recommendations, or use the form below.',
      bestPriceBadge: 'Best Reported Price',
      convenientLocalBadge: 'Convenient Local Market',
      bestOverallBadge: 'Best Overall Match',
      sortBy: 'Sort By',
      sortByPrice: 'Highest Price',
      sortByLocation: 'Home District First',
      sortByDate: 'Latest Date',
      sellAtThisMandi: 'Sell at this Mandi',
      grossRealization: 'Estimated Gross Realization',
      grossRange: 'Gross Realization Range',
      disclaimerNotice: 'Modal price is an official APMC benchmark from AGMARKNET / MSAMB and not a guaranteed trader offer. Actual net receivable is determined after statutory deductions.',
    },
    transactions: {
      title: 'Agricultural Sale Records',
      subtitle: 'Weighing slips, trader transactions, authorized deductions, and ledger tracking.',
      newSaleBtn: 'Record New Sale',
      recordPaymentBtn: 'Record Payment',
      grossAmount: 'Gross Amount',
      netReceivable: 'Net Receivable',
      totalDeductions: 'Total Deductions',
      receivedAmount: 'Amount Received',
      outstandingAmount: 'Outstanding Balance',
      allRecords: 'Transaction History',
      searchPlaceholder: 'Search trader or crop...',
      voiceSearchTooltip: 'Speak to search',
      trader: 'Trader:',
      market: 'Mandi:',
      date: 'Date:',
      settled: 'Settled',
      partial: 'Partial',
      pending: 'Pending',
      details: 'View Details',
      ratePerUnit: 'Rate per Quintal',
      deductionsBreakdown: 'Itemized Slip Deductions:',
      notes: 'Notes / Remarks:',
      evidenceAttached: 'Weighing slip attached',
      videoEvidenceAttached: 'Video evidence attached',
      receiptEvidenceAttached: 'Receipt photo attached',
      viewEvidence: 'View Evidence',
      voiceNote: 'Audio Note:',
      noSalesTitle: 'No Sale Records Found',
      noSalesDesc: 'Record your first produce sale with weighing slip and deductions using the button above.',
      filterNoResult: 'No sale transactions matched your search criteria.',
    },
    payments: {
      title: 'Payments & Receivables',
      subtitle: 'Track cash, UPI, and cheque installment receipts and outstanding trader balances.',
      recordPaymentBtn: 'Record Payment',
      totalReceived: 'Total Received',
      pendingReceivables: 'Pending Receivables',
      settlementRate: 'Settlement Rate',
      paymentHistory: 'Payment Receipts & Installments',
      searchPlaceholder: 'Search reference, receipt, or sale ID...',
      amount: 'Amount Received (in ₹)',
      paymentMode: 'Payment Mode',
      cash: 'Cash',
      upi: 'UPI / Online',
      cheque: 'Cheque',
      bankTransfer: 'Bank Transfer (NEFT/RTGS)',
      paymentDate: 'Payment Date',
      referenceNote: 'Reference / Note',
      linkedSale: 'Link to Sale',
      noPaymentsTitle: 'No Payment Records Found',
      noPaymentsDesc: 'Record cash or online payments received from merchants using the button above.',
      receivedBadge: 'Received',
      evidenceReceipt: 'Receipt Evidence',
      viewReceipt: 'View Receipt',
    },
    profitCoach: {
      title: 'Profit Coach & Financial Guidance',
      subtitle: 'Aging debt prioritization, mandi rate benchmarking, and deduction audit.',
      debtorsTitle: 'Debtor Prioritization',
      debtorsDesc: 'Merchants categorized by outstanding balance magnitude and aging duration.',
      benchmarkTitle: 'Mandi Benchmark Comparison',
      benchmarkDesc: 'Comparison between realized selling prices and official APMC benchmark rates.',
      auditTitle: 'Deductions Audit',
      auditDesc: 'Inspection of hamali, weighing fee, and mandi cess against statutory limits.',
      daysOverdue: 'days overdue',
      riskHigh: 'High Risk',
      riskMedium: 'Medium Risk',
      riskLow: 'Low Risk',
      realizedPrice: 'Realized Rate:',
      mandiBenchmark: 'Mandi Benchmark:',
      priceGain: 'Extra Gain:',
      priceLag: 'Price Lag:',
      totalDeductionsPaid: 'Total Deductions Paid:',
      actionAdvice: 'Actionable Guidance:',
    },
    scanner: {
      title: 'Weighing Slip & Bill Camera Scanner',
      subtitle: 'Capture weighing slips via camera, photo, or video proof to auto-populate sales',
      cameraTab: 'Live Camera',
      uploadTab: 'Photo Upload',
      videoTab: 'Video Evidence',
      textTab: 'Text Entry',
      takePhoto: 'Take Photo',
      rotate: 'Rotate 90°',
      retake: 'Retake',
      selectImage: 'Select weighing slip image',
      selectVideo: 'Select short video evidence of scale or produce',
      textPlaceholder: 'e.g. Mandi name, trader, farmer, weight, and rate...',
      extractBtn: 'Extract with Sarvam AI',
      reviewTitle: 'Extracted Data (Review Draft)',
      confidence: 'Confidence Score:',
      gross: 'Gross Amount:',
      deductions: 'Total Deductions:',
      net: 'Net Receivable:',
      draftNotice: 'This is an uncommitted AI draft. Verify details before saving to your ledger.',
      scanAgain: 'Scan Again',
      confirmSale: 'Confirm & Record Sale',
      evidenceAttached: 'Weighing slip photo evidence attached.',
      videoAttached: 'Video evidence attached.',
    },
    assistant: {
      title: 'Sarvam AI Agricultural Assistant',
      subtitle: 'Ask about market rates and financial accounts in Marathi, Hindi & English',
      inputPlaceholder: 'Ask a question or inquire about today\'s onion prices...',
      listening: 'Listening... speak now',
      processing: 'Thinking...',
      speakBtn: 'Speak',
      sendBtn: 'Send',
      quickPromptsTitle: 'Quick Questions:',
      actionProposalTitle: 'Action Confirmation:',
      confirmExecution: 'Confirm & Execute',
      cancelExecution: 'Cancel',
      executing: 'Executing action...',
      executedSuccess: 'Action executed successfully!',
      audioVoice: 'Listen Audio',
    },
    profile: {
      title: 'Farmer Profile',
      subtitle: 'Manage your personal details, location hierarchy, and language preferences.',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      updateSuccess: 'Profile updated successfully!',
      memberSince: 'Member Since',
      accountDetails: 'Account Information',
      locationInfo: 'Location & Geography',
    },
    common: {
      maharashtra: 'Maharashtra',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'An error occurred. Please try again.',
      phaseNotice: 'Feature In Development',
      phaseNoticeDesc: 'This pillar will be implemented with verified backend integrations in Phase 2.',
      backToDashboard: 'Back to Dashboard',
      retry: 'Retry',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      optional: 'Optional',
      required: 'Required',
      success: 'Success',
    },
  },
};
