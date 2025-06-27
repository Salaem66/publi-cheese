
import { supabase } from '@/integrations/supabase/client';

export const imageUploadService = {
  async uploadImage(imageFile: File): Promise<string> {
    console.log('Processing image upload...');
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    console.log('Uploading image with filename:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('message-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Image upload error:', uploadError.message);
      console.error('Full upload error:', uploadError);
      throw uploadError;
    }

    console.log('Image uploaded successfully:', uploadData);
    const { data: publicUrlData } = supabase
      .storage
      .from('message-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log('Image public URL:', imageUrl);
    return imageUrl;
  }
};
