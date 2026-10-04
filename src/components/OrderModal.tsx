import React, { useState } from 'react';
import { X, CheckCircle2, Phone, Clock, ArrowLeft } from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { getProductPricing, getMinOrderQuantity } from '../utils/productUtils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderComplete: (order?: Order) => void;
  settings?: StoreSettings;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderComplete,
  settings,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const deliveryCharge = 0;
  const itemsTotal = items.reduce(
    (acc, item) => acc + getProductPricing(item.product).currentPrice * item.quantity,
    0
  );
  const grandTotal = itemsTotal;

  const storePhone = settings?.phoneNumber || '+880 1700-123456';
  const cleanPhone = storePhone.replace(/[^\d+]/g, '');

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all required customer details.');
      return;
    }

    const cleanNumber = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    // Check minimum order quantity
    for (const item of items) {
      const minQty = getMinOrderQuantity(item.product);
      if (item.quantity < minQty) {
        setError(`Minimum order quantity is ${minQty} pieces for ${item.product.name}.`);
        return;
      }
    }

    const generatedId = 'BD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);
    setIsSuccess(true);

    const orderData: Order = {
      orderNumber: generatedId,
      customerName: name.trim(),
      mobileNumber: phone.trim(),
      district: deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
      address: address.trim(),
      products: items.map((item) => {
        const pricing = getProductPricing(item.product);
        return {
          productId: item.product.id,
          name: item.product.name,
          price: pricing.currentPrice,
          quantity: item.quantity,
          image: item.product.image,
        };
      }),
      quantities: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: itemsTotal,
      deliveryCharge,
      totalAmount: grandTotal,
      paymentMethod: 'Phone Confirmation',
      paymentStatus: 'Payment Pending',
      orderStatus: 'Payment Pending',
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    onOrderComplete(orderData);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setName('');
    setPhone('');
    setAddress('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {isSuccess ? 'Wholesale Order Placed' : 'Place Wholesale Order'}
            </h3>
            <p className="text-xs text-emerald-100">
              {isSuccess
                ? 'Thank you for shopping with China Direct BD'
                : 'Enter your delivery details to submit your wholesale order'}
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2">
                Order Status: Payment Pending
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 font-mono">
                Order #{orderId}
              </h4>
              {/* Exact User Requested Message */}
              <p className="text-sm font-semibold text-gray-800 mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                "Your order has been received. We will contact you by phone to confirm the payment and order."
              </p>
            </div>

            {/* Customer Order Confirmation Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs text-gray-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order Number:</span>
                <span className="font-mono font-bold text-gray-900">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-bold text-gray-900">{name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mobile Number:</span>
                <span className="font-semibold text-gray-900">{phone}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-bold text-gray-900 text-sm">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-extrabold text-base">
                  ৳{grandTotal.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Call Us Button & Continue Shopping */}
            <div className="flex flex-col gap-2 pt-2">
              {cleanPhone && (
                <a
                  id="modal-btn-call-us"
                  href={`tel:${cleanPhone}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>Call Us ({storePhone})</span>
                </a>
              )}
              <button
                onClick={handleFinish}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-1 border-b border-gray-100">
                Customer & Delivery Information
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name (আপনার নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mobile Number (মোবাইল নম্বর) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600 transition"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  We will call you on this number to confirm payment.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Zone (ডেলিভারি এলাকা) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('inside_dhaka')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition cursor-pointer ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Inside Dhaka
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside_dhaka')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition cursor-pointer ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Outside Dhaka
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Address (সম্পূর্ণ ঠিকানা) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House, Road, Area, Thana, District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Summary Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Wholesale Payment Verification</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your order will be created as <strong>Payment Pending</strong>. We will contact you by phone to confirm payment and order details.
              </p>
            </div>

            {/* Total Display & Submit */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">৳{itemsTotal.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                <span>Total Amount:</span>
                <span className="text-emerald-700 text-base font-extrabold">
                  ৳{grandTotal.toLocaleString('en-US')}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Place Wholesale Order
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
