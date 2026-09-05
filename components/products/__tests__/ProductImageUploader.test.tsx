import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import type { ProductImage } from "@/types/product-form";

import { ProductImageUploader } from "../ProductImageUploader";

describe("ProductImageUploader Component (5-Slot Grid)", () => {
  const sampleImages: ProductImage[] = [
    { id: "img_1", url: "https://example.com/1.png", isPrimary: true },
    { id: "img_2", url: "https://example.com/2.png", isPrimary: false },
  ];

  it("renders 5 slots with uploaded thumbnails and cover photo badge", () => {
    const handleChange = jest.fn();
    render(
      <ProductImageUploader images={sampleImages} onChange={handleChange} />,
    );

    expect(screen.getByText("Cover Photo")).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBe(2);
    expect(screen.getByText("Upload Photo #3")).toBeInTheDocument();
  });

  it("swaps cover photo indicator on click Set Cover", () => {
    const handleChange = jest.fn();
    render(
      <ProductImageUploader images={sampleImages} onChange={handleChange} />,
    );

    const setCoverBtn = screen.getByText("Set Cover");
    fireEvent.click(setCoverBtn);

    expect(handleChange).toHaveBeenCalledWith([
      { id: "img_1", url: "https://example.com/1.png", isPrimary: false },
      { id: "img_2", url: "https://example.com/2.png", isPrimary: true },
    ]);
  });

  it("reorders thumbnails with Move Right button", () => {
    const handleChange = jest.fn();
    render(
      <ProductImageUploader images={sampleImages} onChange={handleChange} />,
    );

    const moveRightBtns = screen.getAllByTitle("Move Right");
    fireEvent.click(moveRightBtns[0]);

    expect(handleChange).toHaveBeenCalledWith([
      { id: "img_2", url: "https://example.com/2.png", isPrimary: false },
      { id: "img_1", url: "https://example.com/1.png", isPrimary: true },
    ]);
  });

  it("removes image on click delete button", () => {
    const handleChange = jest.fn();
    render(
      <ProductImageUploader images={sampleImages} onChange={handleChange} />,
    );

    const deleteBtns = screen.getAllByTitle("Delete Image");
    fireEvent.click(deleteBtns[0]);

    expect(handleChange).toHaveBeenCalledWith([
      { id: "img_2", url: "https://example.com/2.png", isPrimary: true },
    ]);
  });
});
