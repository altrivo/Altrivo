import "@testing-library/jest-dom";
import {
  getCloudinaryUploadSignature,
  uploadToCloudinary,
} from "../cloudinary";

global.fetch = jest.fn();

describe("Cloudinary Frontend Upload Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches signed parameters from backend sign endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        signature: "sha256_mock_sig",
        timestamp: 1770000000,
        apiKey: "api_123",
        cloudName: "artrivo-cloud",
        folder: "vendors/vendor_dev_123/products",
        transformation: "f_auto,q_auto,w_2000,c_limit",
        uploadUrl: "https://api.cloudinary.com/v1_1/artrivo-cloud/image/upload",
        maxFileSize: 10485760,
        allowedFormats: ["jpg", "png", "webp", "avif"],
      }),
    });

    const config = await getCloudinaryUploadSignature("vendor_dev_123");

    expect(config.signature).toBe("sha256_mock_sig");
    expect(config.folder).toBe("vendors/vendor_dev_123/products");
    expect(config.transformation).toBe("f_auto,q_auto,w_2000,c_limit");
  });

  it("rejects files exceeding 10MB limit", async () => {
    const largeFile = new File(["a".repeat(11 * 1024 * 1024)], "oversized.png", {
      type: "image/png",
    });

    await expect(uploadToCloudinary(largeFile)).rejects.toThrow(
      "File exceeds maximum allowed size of 10MB"
    );
  });
});
