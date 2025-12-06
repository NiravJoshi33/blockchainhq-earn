import { supabase } from "../client";

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<string> {
  try {
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    throw new Error(error.message || "Failed to upload image");
  }
}

export async function deleteProfileImage(filePath: string): Promise<void> {
  try {
    const path = filePath.includes("/avatars/")
      ? filePath.split("/avatars/")[1]
      : filePath;

    const { error } = await supabase.storage.from("avatars").remove([path]);

    if (error) {
      throw error;
    }
  } catch (error: any) {
  }
}

