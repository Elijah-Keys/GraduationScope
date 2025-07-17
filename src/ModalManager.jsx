import React, { useState } from "react";
import SignUpModal from "./SignUpModal";
import SignInModal from "./SignInModal";

export default function AuthModals() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

  return (
    <>
      <button onClick={() => setShowSignUp(true)}>Sign Up</button>
      <button onClick={() => setShowSignIn(true)}>Sign In</button>

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onRedirectToLogin={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
          setPrefillEmail={setPrefillEmail}
        />
      )}

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          prefillEmail={prefillEmail}
        />
      )}
    </>
  );
}
