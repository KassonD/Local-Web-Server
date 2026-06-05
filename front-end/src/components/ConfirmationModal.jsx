
function ConfirmationModal({ onConfirm, onDecline, title = "Are you sure?", text = "This action can NOT be undone."}){
    return (
        <>
            <div className="modal-background"></div>
            <div className="modal confirmation-modal">
                <div className="modal-header">
                    <p>{title}</p>
                </div>
                    <div className="confirmation-container">
                        <p>{text}</p>
                        <div className="confirmation-buttons">
                            <button className="subtle yes" onClick={onConfirm}>Yes</button>
                            <button className="subtle no" onClick={onDecline}>No</button>
                        </div>
                    </div>

            </div>
        </>
    )
}

export default ConfirmationModal;