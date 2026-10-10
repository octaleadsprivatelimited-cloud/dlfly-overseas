import { describe, expect, it } from "vitest";
import { isAdminSession } from "@/lib/admin-access";
import { articleSchema, isGoogleMapsEmbed, isSafeImageUrl, youtubeId } from "@/lib/content";
import { initialArticles } from "@/data/initial-content";

describe("Admin authorisation", () => {
  it("allows only the verified designated Google account", () => {
    expect(isAdminSession("dlflyoverseas@gmail.com", true, "google.com")).toBe(true);
    expect(isAdminSession("someone@gmail.com", true, "google.com")).toBe(false);
    expect(isAdminSession("dlflyoverseas@gmail.com", false, "google.com")).toBe(false);
    expect(isAdminSession("dlflyoverseas@gmail.com", true, "password")).toBe(false);
  });
});
describe("Content input safety", () => {
  it("accepts common YouTube URL formats and rejects other destinations", () => {
    for (const value of [
      "dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
    ])
      expect(youtubeId(value)).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtube.com.attacker.example/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeId("javascript:alert(1)")).toBeNull();
  });
  it("accepts only safe image and map sources", () => {
    expect(isSafeImageUrl("/images/dlfly-study.jpg")).toBe(true);
    expect(isSafeImageUrl("https://example.com/photo.jpg")).toBe(true);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("//attacker.example/photo.jpg")).toBe(false);
    expect(isGoogleMapsEmbed("https://www.google.com/maps/embed?pb=example")).toBe(true);
    expect(isGoogleMapsEmbed("https://www.google.com.attacker.example/maps/embed")).toBe(false);
  });
  it("validates editorial content and rejects unsafe slugs", () => {
    expect(initialArticles.every((article) => articleSchema.safeParse(article).success)).toBe(true);
    expect(articleSchema.safeParse({ ...initialArticles[0], slug: "../../admin" }).success).toBe(
      false,
    );
  });
});
