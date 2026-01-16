'use client';

import React, { createContext, useContext, useState } from "react";

type ModalType = 'module' | 'perm' | 'role';

interface ModalContextType {
  // 当前打开的弹窗ID
  openModalId: string | null;
  // 检查特定弹窗是否打开
  isModalOpen(modalId: ModalType): boolean;
  // 通用控制函数
  openModal: (modalId: ModalType, modalData?: any) => void;
  closeModal: () => void;
  // 传递数据
  modalData: any;
  // 新增重置函数
  resetModalData: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (modalId: ModalType, data?: any) => {
    setOpenModalId(modalId);
    setModalData(data);
  }

  const closeModal = () => {
    setOpenModalId(null);
    setModalData(null);
  }

  const isModalOpen = (modalId: ModalType) => openModalId === modalId;

  const resetModalData = () => {
    setModalData(null);
  }

  return (
    <ModalContext.Provider value={{
      openModal,
      openModalId,
      closeModal,
      isModalOpen,
      modalData,
      resetModalData
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
