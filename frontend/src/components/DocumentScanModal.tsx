import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, Upload, CheckCircle2, AlertCircle, X, Sparkles, Edit3, RotateCw, RefreshCw, Video } from 'lucide-react';
import { useLanguage } from '../app/LanguageContext';
import { sarvamService, type DocumentExtractResponse } from '../services/sarvamService';
import { Button } from './Button';
import { Badge } from './Badge';

interface DocumentScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAsSale: (extractedData: any) => void;
}

export const DocumentScanModal: React.FC<DocumentScanModalProps> = ({
  isOpen,
  onClose,
  onConfirmAsSale,
}) => {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<'camera' | 'upload' | 'text' | 'video'>('camera');
  const [documentText, setDocumentText] = useState(
    'लासलगाव बाजार समिती: व्यापारी महालक्ष्मी ऍग्रो. शेतकरी गणेश शिंदे. कांदा आवक २५.५ क्विंटल. दर ₹२,४५० प्रति क्विंटल. हमाली ₹२५०. तोल फी ₹१००.'
  );

  // Camera & Image state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  // Video capture/upload state
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DocumentExtractResponse | null>(null);

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        isMarathi
          ? 'कॅमेरा सुरू करता आला नाही. कृपया ब्राऊझर कॅमेरा परवानगी तपासा किंवा फोटो अपलोड पर्याय वापरा.'
          : isHindi
          ? 'कैमरा शुरू नहीं हो सका। कृपया कैमरा अनुमति जांचें या फोटो अपलोड विकल्प चुनें।'
          : 'Unable to access camera. Please allow camera permissions or upload an image.'
      );
      setCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Switch tabs & manage camera lifecycle
  useEffect(() => {
    if (isOpen && tab === 'camera' && !capturedImage && !extractedData) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, tab, capturedImage, extractedData]);

  if (!isOpen) return null;

  // Capture snapshot from video stream
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    setMediaType('IMAGE');
    stopCamera();
  };

  // Rotate captured image 90 degrees
  const handleRotate = () => {
    if (!capturedImage) return;
    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.88));
        setRotation((prev) => (prev + 90) % 360);
      }
    };
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setRotation(0);
    startCamera();
  };

  // Handle file uploads (image / video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        if (isVideo) {
          setVideoPreview(result);
          setMediaType('VIDEO');
          setCapturedImage(null);
        } else {
          setCapturedImage(result);
          setMediaType('IMAGE');
          setVideoPreview(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform AI extraction via Sarvam AI
  const handleExtract = async () => {
    setError(null);
    try {
      setLoading(true);
      let imgBase64: string | undefined;
      if (capturedImage) {
        imgBase64 = capturedImage.split(',')[1];
      }

      const res = await sarvamService.extractDocument(
        tab === 'text' ? documentText : undefined,
        imgBase64,
        language
      );
      setExtractedData(res);
    } catch (err: any) {
      setError(
        err.message ||
          (isMarathi
            ? 'दस्तऐवज तपासताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Error extracting document. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm extracted data and route to Record Sale modal with attached evidence
  const handleProceedToSale = () => {
    if (!extractedData) return;
    const formattedDeductions = (extractedData.deductions || []).map((d) => ({
      deduction_type: d.deduction_type,
      amount: String(d.amount),
      description: d.description || '',
    }));

    onConfirmAsSale({
      trader_name: extractedData.trader_name || '',
      market_name: extractedData.market_name || '',
      commodity: extractedData.commodity || 'Onion',
      variety: extractedData.variety || 'Standard',
      quantity: extractedData.quantity || '',
      rate_per_unit: extractedData.rate_per_unit || '',
      sale_date: extractedData.sale_date || new Date().toISOString().split('T')[0],
      deductions: formattedDeductions,
      evidence_url: capturedImage || videoPreview || undefined,
      evidence_type: mediaType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-warm-300 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                {t.scanner.title}
                <Badge variant="warning" className="text-xs bg-amber-50 text-amber-800 border-amber-300">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  Sarvam AI
                </Badge>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {t.scanner.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Modes */}
          {!extractedData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('camera');
                    setCapturedImage(null);
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition ${
                    tab === 'camera' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  {t.scanner.cameraTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`py-2 px-1 text-center rounded-lg transition ${
                    tab === 'upload' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  {t.scanner.uploadTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('video')}
                  className={`py-2 px-1 text-center rounded-lg transition ${
                    tab === 'video' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 inline mr-1" />
                  {t.scanner.videoTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('text')}
                  className={`py-2 px-1 text-center rounded-lg transition ${
                    tab === 'text' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  {t.scanner.textTab}
                </button>
              </div>

              {/* TAB: LIVE CAMERA */}
              {tab === 'camera' && (
                <div className="space-y-3">
                  {!capturedImage ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {cameraError ? (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center text-white">
                          <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                          <p className="text-xs">{cameraError}</p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={startCamera}
                            className="mt-3 text-xs bg-white text-gray-900"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> {t.common.retry}
                          </Button>
                        </div>
                      ) : (
                        <div className="absolute bottom-4 inset-x-0 flex justify-center">
                          <button
                            type="button"
                            onClick={handleCaptureSnapshot}
                            className="px-5 py-2.5 rounded-full bg-[#176B45] hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center gap-2 border-2 border-white/80 active:scale-95 transition-transform"
                          >
                            <Camera className="w-4 h-4" />
                            {t.scanner.takePhoto}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Captured Snapshot Preview */
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-300 flex items-center justify-center max-h-72">
                        <img
                          src={capturedImage}
                          alt="Captured slip"
                          className="object-contain max-h-72 w-full transition-transform duration-200"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-1">
                        <button
                          type="button"
                          onClick={handleRotate}
                          className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-[#176B45]" />
                          {t.scanner.rotate}
                        </button>
                        <button
                          type="button"
                          onClick={handleRetake}
                          className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                          {t.scanner.retake}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PHOTO UPLOAD */}
              {tab === 'upload' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.scanner.selectImage}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EAF3EA] file:text-[#176B45] hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {capturedImage && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 max-h-56 flex justify-center bg-gray-50">
                      <img src={capturedImage} alt="Slip preview" className="object-contain max-h-56" />
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VIDEO EVIDENCE */}
              {tab === 'video' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.scanner.selectVideo}
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                  />
                  {videoPreview && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-black flex justify-center">
                      <video src={videoPreview} controls className="max-h-56 w-full object-contain" />
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500">
                    💡 {t.scanner.videoAttached}
                  </p>
                </div>
              )}

              {/* TAB: TEXT ENTRY */}
              {tab === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.transactions.deductionsBreakdown}
                  </label>
                  <textarea
                    rows={4}
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder={t.scanner.textPlaceholder}
                    className="w-full p-3 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#176B45] focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Preview and Confirmation State */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {t.scanner.reviewTitle}
                </div>
                <Badge variant="success" className="text-[11px] bg-emerald-100 text-emerald-800">
                  {t.scanner.confidence} {Math.round(extractedData.confidence_score * 100)}%
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm border border-gray-200">
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.transactions.trader}</span>
                  <strong className="text-gray-900">{extractedData.trader_name || '—'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.transactions.market}</span>
                  <strong className="text-gray-900">{extractedData.market_name || 'APMC'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.harvest.cropLabel}:</span>
                  <strong className="text-emerald-700 font-bold">{extractedData.commodity}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.harvest.qtyLabel}:</span>
                  <strong className="text-gray-900">{extractedData.quantity} Qtl</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.transactions.ratePerUnit}:</span>
                  <strong className="text-gray-900">₹{extractedData.rate_per_unit}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-xs text-gray-500">
                  <span>{t.scanner.gross}</span>
                  <strong className="text-gray-900">₹{extractedData.gross_amount}</strong>
                </div>
                {extractedData.total_deductions && Number(extractedData.total_deductions) > 0 && (
                  <div className="flex justify-between border-b pb-1.5 text-xs text-red-600">
                    <span>{t.scanner.deductions}</span>
                    <strong>-₹{extractedData.total_deductions}</strong>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-sm font-bold text-gray-900">
                  <span>{t.scanner.net}</span>
                  <span className="text-[#176B45] text-base">₹{extractedData.net_receivable}</span>
                </div>
              </div>

              {(capturedImage || videoPreview) && (
                <div className="flex items-center gap-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {mediaType === 'VIDEO' ? t.scanner.videoAttached : t.scanner.evidenceAttached}
                  </span>
                </div>
              )}

              <p className="text-xs text-gray-500 italic bg-amber-50/70 p-2 rounded-lg border border-amber-200 text-amber-900">
                ⚠️ {t.scanner.draftNotice}
              </p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
          {!extractedData ? (
            <>
              <Button variant="secondary" onClick={onClose} className="min-h-[44px]">
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleExtract}
                isLoading={loading}
                disabled={tab === 'camera' && !capturedImage}
                className="bg-[#176B45] text-white min-h-[44px] px-6 font-bold"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                {t.scanner.extractBtn}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExtractedData(null);
                  setCapturedImage(null);
                  setVideoPreview(null);
                }}
                className="min-h-[44px]"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {t.scanner.scanAgain}
              </Button>
              <Button
                variant="primary"
                onClick={handleProceedToSale}
                className="bg-[#176B45] text-white min-h-[44px] px-6 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {t.scanner.confirmSale}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
