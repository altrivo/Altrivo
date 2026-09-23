import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import { StorefrontPreviewModal } from "@/components/storefront/StorefrontPreviewModal";

describe("StorefrontPreviewModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <StorefrontPreviewModal isOpen={false} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal dialog, toolbar, viewport toggles, and iframe when isOpen is true", () => {
    render(
      <StorefrontPreviewModal isOpen={true} onClose={jest.fn()} previewUrl="/" />
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Artrivo Store — Live Storefront Preview/i)).toBeDefined();

    // Viewport pills
    expect(screen.getByText("Desktop")).toBeDefined();
    expect(screen.getByText("Mobile")).toBeDefined();

    // Action buttons
    expect(screen.getByText("Copy Shareable Link")).toBeDefined();
    expect(screen.getByText("Open in New Tab")).toBeDefined();

    // Iframe
    const iframe = screen.getByTitle("Storefront Desktop Live Preview");
    expect(iframe).toBeDefined();
    expect(iframe.getAttribute("src")).toBe("/");
  });

  it("toggles to mobile viewport frame on mobile pill click", () => {
    render(
      <StorefrontPreviewModal isOpen={true} onClose={jest.fn()} previewUrl="/" />
    );

    const mobileBtn = screen.getByText("Mobile");
    fireEvent.click(mobileBtn);

    const mobileIframe = screen.getByTitle("Storefront Mobile Live Preview");
    expect(mobileIframe).toBeDefined();
  });

  it("invokes onClose when close button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <StorefrontPreviewModal isOpen={true} onClose={handleClose} previewUrl="/" />
    );

    const closeBtn = screen.getByLabelText("Close storefront preview modal");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
