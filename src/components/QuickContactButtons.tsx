import React, { useState } from 'react';
import { Phone, MessageCircle, Facebook, X, MessageSquare, Send, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface QuickContactButtonsProps {
  settings: StoreSettings;
}

const BANGLA_QUICK_CHATS = [
  'পাইকারি দর কত?',
  'ডেলিভারি চার্জ কত এবং কত দিন লাগবে?',
  'পণ্যটি কি স্টকে আছে?',
  'অর্ডার কনফার্ম করতে চাই',
];

export const QuickContactButtons: React.FC<QuickContactButtonsProps> = ({ settings }) => {
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState('');

  const cleanPhone = settings.phoneNumber ? settings.phoneNumber.replace(/[^\d+]/g, '') : '';

  // Format WhatsApp number cleanly for wa.me link
  let cleanWhatsApp = settings.whatsAppNumber ? settings.whatsAppNumber.replace(/\D/g, '') : '';
  if (cleanWhatsApp.startsWith('01')) {
    cleanWhatsApp = '88' + cleanWhatsApp;
  }

  const defaultBanglaMsg = 'আসসালামু আলাইকুম, আমি আপনাদের পণ্য সম্পর্কে বিস্তারিত জানতে এবং অর্ডার করতে চাচ্ছি।';
  
  const getWhatsAppUrl = (customMsg?: string) => {
    if (!cleanWhatsApp) return '';
    const textToSend = customMsg?.trim() || defaultBanglaMsg;
    return `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(textToSend)}`;
  };

  const whatsAppUrl = getWhatsAppUrl();

  // Format Facebook URL
  let fbUrl = settings.facebookPage ? settings.facebookPage.trim() : '';
  if (fbUrl && !fbUrl.startsWith('http://') && !fbUrl.startsWith('https://')) {
    fbUrl = 'https://' + fbUrl;
  }

  // If no contact options are configured, don't render floating widget
  if (!cleanPhone && !whatsAppUrl && !fbUrl) {
    return null;
  }

  const handleSendCustomWhatsApp = (e?: React.FormEvent, msgToSend?: string) => {
    if (e) e.preventDefault();
    if (!cleanWhatsApp) return;
    const finalMsg = msgToSend || quickMsg;
    const url = getWhatsAppUrl(finalMsg);
    window.open(url, '_blank', 'noopener,noreferrer');
    setQuickMsg('');
    setIsChatBoxOpen(false);
  };

  return (
    <div
      id="quick-contact-container"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 font-sans"
    >
      {/* Bangla Chat Popup Box */}
      {isChatBoxOpen && (
        <div
          id="bangla-chat-modal"
          className="w-[330px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 relative">
            <button
              id="close-bangla-chat-modal"
              onClick={() => setIsChatBoxOpen(false)}
              className="absolute top-3.5 right-3.5 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer"
              aria-label="চ্যাট বন্ধ করুন"
              title="চ্যাট বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-700 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>সরাসরি চ্যাট ও সাপোর্ট</span>
                  <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded font-normal">
                    অনলাইনে আছেন
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {settings.storeName || 'Shanghai Namutong Trade'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 bg-gray-50/70 space-y-3.5 text-gray-800">
            {/* Friendly Greeting in Bengali */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs leading-relaxed text-emerald-950">
              <p className="font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                আসসালামু আলাইকুম!
              </p>
              যেকোনো পণ্য সম্পর্কে তথ্য ও পাইকারি মূল্য জানতে বা অর্ডার কনফার্ম করতে সরাসরি চ্যাট করুন:
            </div>

            {/* Bangla Quick Inquiry Chips */}
            {cleanWhatsApp && (
              <div>
                <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  দ্রুত প্রশ্ন বেছে নিন:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BANGLA_QUICK_CHATS.map((chatText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendCustomWhatsApp(undefined, chatText)}
                      className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition text-left cursor-pointer shadow-2xs active:scale-95"
                    >
                      💬 {chatText}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick WhatsApp message input in Bengali */}
            {cleanWhatsApp && (
              <form onSubmit={handleSendCustomWhatsApp} className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  আপনার মেসেজ লিখুন (হোয়াটসঅ্যাপে যাবে):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={quickMsg}
                    onChange={(e) => setQuickMsg(e.target.value)}
                    placeholder="যেমন: এই প্রোডাক্টটির ডেলিভারি কত দিনে পাব?"
                    className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 gap-1"
                    title="হোয়াটসঅ্যাপে পাঠান"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </form>
            )}

            {/* Chat Action Buttons in Bengali */}
            <div className="space-y-2 pt-1">
              {whatsAppUrl && (
                <a
                  id="chat-modal-btn-whatsapp"
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 rounded-xl shadow-xs hover:shadow-md transition text-xs font-bold group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 fill-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">হোয়াটসঅ্যাপে সরাসরি চ্যাট</div>
                      <div className="text-[10px] text-emerald-100 font-normal">তাৎক্ষণিক উত্তর পাবেন</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white group-hover:bg-white/30 transition">
                    চ্যাট শুরু করুন
                  </span>
                </a>
              )}

              {fbUrl && (
                <a
                  id="chat-modal-btn-facebook"
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between bg-[#1877F2] hover:bg-[#166fe5] text-white p-2.5 rounded-xl shadow-xs hover:shadow-md transition text-xs font-bold group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Facebook className="w-4 h-4 fill-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">ফেসবুক মেসেঞ্জারে চ্যাট</div>
                      <div className="text-[10px] text-blue-100 font-normal">অফিশিয়াল পেজে ইনবক্স করুন</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white group-hover:bg-white/30 transition">
                    ইনবক্স করুন
                  </span>
                </a>
              )}

              {cleanPhone && (
                <a
                  id="chat-modal-btn-call"
                  href={`tel:${cleanPhone}`}
                  className="w-full flex items-center justify-between bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl shadow-xs hover:shadow-md transition text-xs font-bold group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs">সরাসরি ফোনে কথা বলুন</div>
                      <div className="text-[10px] text-emerald-100 font-normal">{settings.phoneNumber}</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white group-hover:bg-white/30 transition">
                    কল দিন
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Footer Note in Bengali */}
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 text-[11px] text-gray-500 text-center">
            সকাল ১০:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত কাস্টমার চ্যাট সেবা সক্রিয়
          </div>
        </div>
      )}

      {/* Direct Floating Contact Stack in Bengali */}
      <div className="flex flex-col gap-2 items-end">
        {/* Main "চ্যাট করুন" Toggle Button */}
        <button
          id="btn-toggle-bangla-chat"
          type="button"
          onClick={() => setIsChatBoxOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl font-bold text-xs sm:text-sm transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border-2 border-white"
        >
          {isChatBoxOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>চ্যাট বন্ধ করুন</span>
            </>
          ) : (
            <>
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              </div>
              <span>চ্যাট করুন</span>
            </>
          )}
        </button>

        {/* WhatsApp Direct Button in Bengali */}
        {whatsAppUrl && !isChatBoxOpen && (
          <a
            id="quick-contact-whatsapp"
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-full shadow-lg hover:shadow-xl font-bold text-xs transition transform hover:-translate-y-0.5 active:scale-95 group"
            title="হোয়াটসঅ্যাপে চ্যাট করুন"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>হোয়াটসঅ্যাপ চ্যাট</span>
          </a>
        )}

        {/* Direct Call Button in Bengali */}
        {cleanPhone && !isChatBoxOpen && (
          <a
            id="quick-contact-call"
            href={`tel:${cleanPhone}`}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-full shadow-lg hover:shadow-xl font-bold text-xs transition transform hover:-translate-y-0.5 active:scale-95 group"
            title="সরাসরি কল করুন"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>সরাসরি কল</span>
          </a>
        )}

        {/* Facebook Button in Bengali */}
        {fbUrl && !isChatBoxOpen && (
          <a
            id="quick-contact-facebook"
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-3.5 py-2 rounded-full shadow-lg hover:shadow-xl font-bold text-xs transition transform hover:-translate-y-0.5 active:scale-95 group"
            title="ফেসবুক পেজে চ্যাট করুন"
          >
            <Facebook className="w-4 h-4 fill-white shrink-0" />
            <span>ফেসবুক চ্যাট</span>
          </a>
        )}
      </div>
    </div>
  );
};
