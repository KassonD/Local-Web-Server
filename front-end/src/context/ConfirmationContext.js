import { createContext, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";
 
export const ConfirmationContext = createContext();

export function ConfirmationContextProvider({ children }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [resolver, setResolver] = useState(null);
    const [title, setTitle] = useState("Are you sure?");
    const [text, setText] = useState("This action can NOT be undone.");

    const confirm = (confirmTitle = "Are you sure?", confirmText = "This action can NOT be undone.") => {
        setTitle(confirmTitle);
        setText(confirmText);
        setShowConfirmation(true);

        return new Promise((resolve, reject) => {
            setResolver(() => resolve);
        });
    }

    const onConfirm = () => {
        resolver(true);
        setShowConfirmation(false);
    }

    const onDecline = () => {
        resolver(false);
        setShowConfirmation(false);
    }

    return (
        <ConfirmationContext.Provider value={confirm}>
            {children}
            
            {showConfirmation && 
                <ConfirmationModal onConfirm={onConfirm} onDecline={onDecline} title={title} text={text}></ConfirmationModal>
            }
        </ConfirmationContext.Provider>
    )
}