import React from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({
    title = "Confirmation",
    message = "Êtes-vous sûr de vouloir effectuer cette action ?",
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Annuler",
    danger = false,
    alertMode = false,
    type = "warning" // warning, info, success, danger
}) {
    const getIcon = () => {
        if (type === "success") return "✅";
        if (type === "danger") return "❌";
        if (type === "info") return "ℹ️";
        return "⚠️";
    };

    return (
        <div className="confirmBackdrop" onClick={alertMode ? onConfirm : onCancel}>
            <div className="confirmModal" onClick={(e) => e.stopPropagation()}>
                <div className="confirmHeader">
                    <div className="confirmIcon">{getIcon()}</div>
                    <h3 className="confirmTitle">{title}</h3>
                </div>
                <p className="confirmMessage">{message}</p>
                <div className="confirmActions">
                    {!alertMode && (
                        <button className="confirmBtn cancel" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button className={`confirmBtn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
