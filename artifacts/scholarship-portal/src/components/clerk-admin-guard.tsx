"use client";

import { useEffect } from "react";

const STYLE_ID = "clerk-admin-guard-style";

/**
 * Clerk generates class names like cl-profileSection__<id> from ProfileSectionId.
 * The "Delete account" section uses id="danger" so the class is cl-profileSection__danger.
 */
const INJECTED_CSS = `
  .cl-profileSection__danger,
  .cl-profileSectionHeader__danger,
  .cl-profileSectionTitle__danger,
  .cl-profileSectionTitleText__danger,
  .cl-profileSectionContent__danger,
  .cl-profileSectionItem__danger,
  .cl-profileSectionItemList__danger,
  .cl-profileSectionPrimaryButton__danger,
  .cl-profileSectionButtonGroup__danger {
    display: none !important;
  }
`;

export function ClerkAdminGuard() {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = INJECTED_CSS;
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
