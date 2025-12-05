import { supabase } from "../client";

/**
 * Upload a profile image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user ID to use as the file name
 * @returns The public URL of the uploaded image
 */
export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    // Create a unique file name using userId and timestamp
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Replace existing file with same name
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    throw new Error(error.message || "Failed to upload image");
  }
}

/**
 * Delete a profile image from Supabase Storage
 * @param filePath - The path to the file in storage
 */
export async function deleteProfileImage(filePath: string): Promise<void> {
  try {
    // Extract the file path from the full URL if needed
    const path = filePath.includes("/avatars/")
      ? filePath.split("/avatars/")[1]
      : filePath;

    const { error } = await supabase.storage.from("avatars").remove([path]);

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error("Error deleting profile image:", error);
    // Don't throw - deletion is not critical
  }
}

