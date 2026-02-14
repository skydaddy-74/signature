"use client";

import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [html, setHtml] = useState("");
  const [advisorEmail, setAdvisorEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // editor | preview
  const fileInputRef = useRef(null);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...files]);
  }, []);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!html.trim() || !advisorEmail.trim() || !userId.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("html", html);
    formData.append("advisorEmail", advisorEmail);
    formData.append("userId", userId);

    images.forEach((img, i) => {
      formData.append(`image_${i}`, img);
    });

    try {
      const res = await fetch("/api/process-signature", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process signature");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setHtml("");
    setAdvisorEmail("");
    setUserId("");
    setImages([]);
    setResult(null);
    setError(null);
  };

  // Count <img> tags in the HTML
  const imgTagCount = (html.match(/<img\b/gi) || []).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--finny-navy)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(15, 23, 41, 0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--finny-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--finny-blue)" }}
            >
              F
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Signature Tool
            </span>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-sm px-4 py-1.5 rounded-md transition-colors"
              style={{
                color: "var(--finny-muted)",
                border: "1px solid var(--finny-border)",
              }}
              onMouseOver={(e) => (e.target.style.borderColor = "var(--finny-blue-light)")}
              onMouseOut={(e) => (e.target.style.borderColor = "var(--finny-border)")}
            >
              Process Another
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Success State */}
        {result && (
          <div
            className="rounded-xl p-8 mb-6 border"
            style={{
              background: "rgba(16, 185, 129, 0.06)",
              borderColor: "rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16, 185, 129, 0.15)" }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-1">
                  Signature Uploaded Successfully
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--finny-muted)" }}>
                  {result.details.imagesUploaded} image(s) uploaded to CDN. Signature HTML saved.
                </p>
                <div
                  className="rounded-lg p-4 text-xs font-mono space-y-1"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  {result.details.cdnPaths.map((p, i) => (
                    <div key={i} className="text-slate-400">
                      <span className="text-emerald-500">✓</span> {p}
                    </div>
                  ))}
                  <div className="text-slate-400">
                    <span className="text-emerald-500">✓</span> {result.details.signaturePath}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="rounded-xl p-4 mb-6 border flex items-center gap-3"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {!result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Advisor Info + Images */}
            <div className="space-y-6">
              {/* Advisor Info Card */}
              <div
                className="rounded-xl border p-5"
                style={{
                  background: "var(--finny-surface)",
                  borderColor: "var(--finny-border)",
                }}
              >
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Advisor Info
                </h2>
                <div className="space-y-3">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--finny-muted)" }}
                    >
                      Advisor Email
                    </label>
                    <input
                      type="email"
                      value={advisorEmail}
                      onChange={(e) => setAdvisorEmail(e.target.value)}
                      placeholder="advisor@example.com"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--finny-border)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--finny-blue)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--finny-border)")}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--finny-muted)" }}
                    >
                      User ID
                    </label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. 12345"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--finny-border)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--finny-blue)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--finny-border)")}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Card */}
              <div
                className="rounded-xl border p-5"
                style={{
                  background: "var(--finny-surface)",
                  borderColor: "var(--finny-border)",
                }}
              >
                <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Images
                </h2>
                <p className="text-xs mb-4" style={{ color: "var(--finny-muted)" }}>
                  {imgTagCount > 0
                    ? `${imgTagCount} <img> tag(s) detected in HTML`
                    : "Upload images used in the signature"}
                </p>

                {/* Drop Zone */}
                <div
                  className={`drop-zone rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                    dragOver ? "drag-over" : ""
                  }`}
                  style={{
                    borderColor: dragOver ? "var(--finny-blue)" : "var(--finny-border)",
                    background: dragOver ? "rgba(37,99,235,0.05)" : "transparent",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    className="mx-auto mb-2"
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#475569"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs" style={{ color: "var(--finny-muted)" }}>
                    Drop images here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Image List */}
                {images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg px-3 py-2"
                        style={{ background: "rgba(0,0,0,0.2)" }}
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{img.name}</p>
                          <p className="text-xs" style={{ color: "var(--finny-muted)" }}>
                            {(img.size / 1024).toFixed(1)} KB → img #{i + 1}
                          </p>
                        </div>
                        <button
                          onClick={() => removeImage(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <p className="text-xs pt-1" style={{ color: "var(--finny-muted)" }}>
                      Images map to {'<img>'} tags in order (image 1 → 1st img tag, etc.)
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={processing || !html.trim() || !advisorEmail.trim() || !userId.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: processing
                    ? "var(--finny-border)"
                    : "var(--finny-blue)",
                }}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Process & Upload Signature"
                )}
              </button>
            </div>

            {/* Right Column: HTML Editor / Preview */}
            <div className="lg:col-span-2">
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  background: "var(--finny-surface)",
                  borderColor: "var(--finny-border)",
                }}
              >
                {/* Tab Bar */}
                <div
                  className="flex border-b"
                  style={{ borderColor: "var(--finny-border)" }}
                >
                  <button
                    onClick={() => setActiveTab("editor")}
                    className="px-5 py-3 text-sm font-medium transition-colors relative"
                    style={{
                      color: activeTab === "editor" ? "white" : "var(--finny-muted)",
                    }}
                  >
                    HTML Code
                    {activeTab === "editor" && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: "var(--finny-blue)" }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="px-5 py-3 text-sm font-medium transition-colors relative"
                    style={{
                      color: activeTab === "preview" ? "white" : "var(--finny-muted)",
                    }}
                  >
                    Preview
                    {activeTab === "preview" && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: "var(--finny-blue)" }}
                      />
                    )}
                  </button>
                </div>

                {/* Editor */}
                {activeTab === "editor" && (
                  <div className="p-1">
                    <textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder="Paste the email signature HTML here..."
                      className="html-input w-full bg-transparent text-slate-300 placeholder-slate-600 outline-none resize-none p-4"
                      style={{ minHeight: "500px" }}
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Preview */}
                {activeTab === "preview" && (
                  <div className="p-6">
                    {html.trim() ? (
                      <div
                        className="signature-preview bg-white text-black rounded-lg p-6"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : (
                      <div className="text-center py-20" style={{ color: "var(--finny-muted)" }}>
                        <p className="text-sm">Paste HTML in the editor to see a preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
