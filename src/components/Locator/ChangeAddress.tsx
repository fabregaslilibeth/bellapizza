'use client';

import { useState } from 'react';
import { useOrderPreference } from '@/context/OrderPreferenceContext';

export default function ChangeAddress() {
  const { orderPreference, address, selectedStore, isChangeAddressVisible, setIsChangeAddressVisible, setAddress, setSelectedStore } = useOrderPreference();
  const [ isChangingStore, setIsChangingStore ] = useState(false);

  const confirmChangeAddress = () => {
    setIsChangingStore(true);
  };

  const handleChangeAddress = () => {
    setAddress(null);
    setSelectedStore(null);
    setIsChangeAddressVisible(false);
  };

  const handleCancel = () => {
    setIsChangingStore(false);
    setIsChangeAddressVisible(false);
  };

  if (!isChangeAddressVisible) {
    return null;
  }

  const getDisplayContent = () => {
    if (address) {
      return (
        <div className="flex w-full justify-between">
          <div>
            <p className="font-semibold">
              {address.municipality}, {address.province}
            </p>
            <p className="text-sm text-gray-500 capitalize">{orderPreference}</p>
          </div>
        </div>
      );
    }

    if (selectedStore) {
      return (
        <div className="flex w-full justify-between">
        <div>
          <p className="font-semibold">
            {selectedStore.name}
          </p>
          <p className="text-sm text-gray-500 capitalize">Pick up</p>
        </div>
      </div>
      );
    }
  };

  return (
   <>
   <div className="fixed inset-0 bg-black opacity-60 z-40"/>
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsChangeAddressVisible(false)} >
      <div className="w-full sm:w-3/4 md:w-1/2 2xl:w-1/4 bg-white shadow-lg rounded-lg border border-gray-300" onClick={(e) => e.stopPropagation()}>
        {isChangingStore && (
          <>
            <div className="px-4 py-4 border-b border-gray-300">
            <h3>Do you want to change disposition, your cart will be empty?</h3>
             
            </div>
            <div className='flex gap-2 px-4 w-full justify-between'>
              <button className="border-r-1 border-gray-300 cursor-pointer text-center w-full" onClick={handleCancel}>No</button>
              <button className="py-4 cursor-pointer text-center w-full" onClick={handleChangeAddress}>Yes</button>
            </div>
          </>
        )}

        {!isChangingStore && (
          <>
            <div className="bg-gray-100 p-4 m-4">
             {getDisplayContent()}
            </div>

            <div className="p-4 m-4 flex gap-2 flex-col">
              <button className="bg-green-600 w-full text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => setIsChangeAddressVisible(false)}>Continue to order</button>
              <button className="text-green-600 py-2 rounded-md cursor-pointer" onClick={confirmChangeAddress}>Or change address</button>
            </div>
          </>
        )}
      </div>
    </div>
   </>
  );
}
