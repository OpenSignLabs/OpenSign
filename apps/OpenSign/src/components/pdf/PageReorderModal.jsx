import React, { useEffect, useState, useRef } from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";

export default function PageReorderModal({
  isOpen,
  handleClose,
  totalPages = 0,
  onSave
}) {
  const { t } = useTranslation();
  const [order, setOrder] = useState([]);
  // Keeps track of the page order relative to the original PDF
  const orderRef = useRef([]);
  // Captures the order when the modal opens
  const initialOrderRef = useRef([]);

  // Initialize orderRef when total pages change (e.g. after upload)
  useEffect(() => {
    if (orderRef.current.length !== totalPages) {
      orderRef.current = Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  }, [totalPages]);

  // When modal opens, display the last saved order and store it as initial
  useEffect(() => {
    if (isOpen) {
      setOrder(orderRef.current);
      initialOrderRef.current = [...orderRef.current];
    }
  }, [isOpen]);

  const move = (index, dir) => {
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= order.length) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setOrder(newOrder);
  };

  const handleSave = () => {
    const saveOrder = order.map((num) =>
      initialOrderRef.current.indexOf(num) + 1
    );
    // Persist the new display order for next time
    orderRef.current = [...order];
    onSave && onSave(saveOrder);
  };

  const isUnchanged =
    order.length === initialOrderRef.current.length &&
    order.every((n, i) => n === initialOrderRef.current[i]);

  return (
    <ModalUi isOpen={isOpen} handleClose={handleClose} title={t("reorder-pages")}> 
      <div className="p-[20px] flex flex-col gap-2 text-base-content">
        {order.map((num, i) => (
          <div key={num} className="flex items-center justify-between">
            <span>
              {t("page")} {num}
            </span>
            <div className="flex gap-1">
              <button
                className="op-btn op-btn-xs op-btn-ghost text-base-content"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <i className="fa-light fa-arrow-up"></i>
              </button>
              <button
                className="op-btn op-btn-xs op-btn-ghost text-base-content"
                disabled={i === order.length - 1}
                onClick={() => move(i, 1)}
              >
                <i className="fa-light fa-arrow-down"></i>
              </button>
            </div>
          </div>
        ))}
        <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
        <button onClick={handleSave} type="button" className="op-btn op-btn-primary" disabled={isUnchanged}>
          {t("save")}
        </button>
        <button
          onClick={handleClose}
          type="button"
          className="op-btn op-btn-ghost text-base-content ml-1"
        >
          {t("close")}
        </button>
      </div>
    </ModalUi>
  );
}
