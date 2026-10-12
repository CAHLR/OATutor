import { prepareFeedbackScreenshot } from "./FeedbackScreenshot";

test("screenshot input rejects non-images and oversized files before decoding", async () => {
    await expect(prepareFeedbackScreenshot({ type: "image/svg+xml", size: 20 })).rejects.toThrow("PNG, JPEG, or WebP");
    await expect(prepareFeedbackScreenshot({ type: "image/jpeg", size: 6 * 1024 * 1024 })).rejects.toThrow("smaller than 5 MB");
});

test("a screenshot is resized and re-encoded as JPEG, and its temporary URL is released", async () => {
    const OriginalImage = global.Image;
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => "blob:test-image");
    URL.revokeObjectURL = jest.fn();
    global.Image = class {
        width = 3200;
        height = 1600;
        set src(value) { this.onload(); }
    };
    const drawImage = jest.fn();
    const context = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ fillRect: jest.fn(), drawImage });
    const encode = jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,/9j/2Q==");
    try {
        const screenshot = await prepareFeedbackScreenshot({ type: "image/png", size: 1000 });
        expect(screenshot).toMatchObject({ width: 1600, height: 800, mimeType: "image/jpeg" });
        expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 800);
        expect(encode).toHaveBeenCalledWith("image/jpeg", 0.85);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-image");
    } finally {
        global.Image = OriginalImage;
        URL.createObjectURL = createObjectURL;
        URL.revokeObjectURL = revokeObjectURL;
        context.mockRestore();
        encode.mockRestore();
    }
});
