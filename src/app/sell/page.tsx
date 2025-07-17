'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import sellStyles from './sell.module.css';
import commonStyles from '@/styles/common.module.css';

export default function SellPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [plyFile, setPlyFile] = useState<File | null>(null);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]); // サムネイルファイル
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number[]>([]); // 各サムネイルの進捗
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePlyFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.ply')) {
        setPlyFile(file);
        setError(null);
      } else {
        setPlyFile(null);
        setError('対応しているファイル形式は.plyのみです。');
      }
    }
  }, []);

  const handleThumbnailFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length + thumbnailFiles.length > 8) {
      setError('サムネイルは8枚までアップロードできます。');
      return;
    }

    setThumbnailFiles(prev => [...prev, ...imageFiles]);
    setError(null);
  }, [thumbnailFiles]);

  const removeThumbnail = useCallback((index: number) => {
    setThumbnailFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.ply')) {
        setPlyFile(file);
        setError(null);
      } else {
        setPlyFile(null);
        setError('対応しているファイル形式は.plyのみです。');
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('商品を販売するにはログインが必要です。');
      setLoading(false);
      return;
    }

    if (!plyFile) {
      setError('.plyファイルを選択してください。');
      setLoading(false);
      return;
    }

    // 価格のバリデーション
    const finalPrice = isFree ? 0 : parseFloat(price);
    if (!isFree && (isNaN(finalPrice) || finalPrice <= 0)) {
      setError('有効な価格を入力してください。');
      setLoading(false);
      return;
    }

    let modelFileUrl = '';
    const modelFilePath = `${user.id}/${Date.now()}-${plyFile.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-models')
        .upload(modelFilePath, plyFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          },
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-models')
        .getPublicUrl(modelFilePath);
      
      modelFileUrl = publicUrlData.publicUrl;

    } catch (uploadError: any) {
      setError(`3Dモデルファイルのアップロードに失敗しました: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // サムネイル画像のアップロード
    const uploadedThumbnailUrls: string[] = [];
    if (thumbnailFiles.length > 0) {
      setThumbnailUploadProgress(Array(thumbnailFiles.length).fill(0));
      for (let i = 0; i < thumbnailFiles.length; i++) {
        const thumbnailFile = thumbnailFiles[i];
        const thumbnailFilePath = `${user.id}/thumbnails/${Date.now()}-${thumbnailFile.name}`;

        try {
          const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
            .from('product-thumbnails')
            .upload(thumbnailFilePath, thumbnailFile, {
              cacheControl: '3600',
              upsert: false,
              onUploadProgress: (event) => {
                if (event.total) {
                  setThumbnailUploadProgress(prev => {
                    const newProgress = [...prev];
                    newProgress[i] = Math.round((event.loaded / event.total) * 100);
                    return newProgress;
                  });
                }
              },
            });

          if (thumbnailUploadError) {
            throw thumbnailUploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from('product-thumbnails')
            .getPublicUrl(thumbnailFilePath);
          
          uploadedThumbnailUrls.push(publicUrlData.publicUrl);

        } catch (thumbnailUploadError: any) {
          setError(`サムネイル画像のアップロードに失敗しました: ${thumbnailUploadError.message}`);
          setLoading(false);
          return;
        }
      }
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: finalPrice,
        sample_image_url: modelFileUrl, // 3DモデルファイルのURLを保存
        thumbnail_urls: uploadedThumbnailUrls, // サムネイル画像のURLを保存
        user_id: user.id,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <main className={sellStyles.container}>
      <h1 className={sellStyles.heading}>3DGSモデルを出品する</h1>
      <form onSubmit={handleSubmit} className={sellStyles.form}>
        {error && <p className={sellStyles.errorMessage}>{error}</p>}
        
        <div className={sellStyles.formGroup}>
          <label htmlFor="file-upload" className={sellStyles.label}>3Dモデルファイル</label>
          <p className={sellStyles.fileTypeHint}>対応ファイル形式: .ply</p>
          <div 
            className={sellStyles.dropArea}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {plyFile ? (
              <p>{plyFile.name} ({Math.round(plyFile.size / 1024)} KB)</p>
            ) : (
              <p>ファイルをここにドラッグ＆ドロップするか、クリックして選択</p>
            )}
            <input
              type="file"
              id="file-upload"
              accept=".ply"
              onChange={handlePlyFileChange}
              className={sellStyles.fileInput}
            />
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className={sellStyles.progressBarContainer}>
              <div className={sellStyles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
              <span className={sellStyles.progressText}>{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* サムネイルアップロードセクション */}
        <div className={sellStyles.formGroup}>
          <label htmlFor="thumbnail-upload" className={sellStyles.label}>サムネイル画像</label>
          <p className={sellStyles.fileTypeHint}>最大8枚までアップロード可能 (画像ファイルのみ)</p>
          <div className={sellStyles.thumbnailUploadArea}>
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              multiple
              onChange={handleThumbnailFileChange}
              className={sellStyles.fileInput}
            />
            <p>クリックして画像を選択</p>
          </div>
          <div className={sellStyles.thumbnailPreviewContainer}>
            {thumbnailFiles.map((file, index) => (
              <div key={index} className={sellStyles.thumbnailPreviewItem}>
                <img src={URL.createObjectURL(file)} alt={`Thumbnail ${index + 1}`} className={sellStyles.thumbnailImage} />
                <button type="button" onClick={() => removeThumbnail(index)} className={sellStyles.removeThumbnailButton}>×</button>
                {thumbnailUploadProgress[index] > 0 && thumbnailUploadProgress[index] < 100 && (
                  <div className={sellStyles.thumbnailProgressBarContainer}>
                    <div className={sellStyles.thumbnailProgressBar} style={{ width: `${thumbnailUploadProgress[index]}%` }}></div>
                    <span className={sellStyles.thumbnailProgressText}>{thumbnailUploadProgress[index]}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={sellStyles.formGroup}>
          <label htmlFor="name" className={sellStyles.label}>商品名</label>
          <input
            type="text"
            id="name"
            className={sellStyles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={sellStyles.formGroup}>
          <label htmlFor="description" className={sellStyles.label}>説明</label>
          <textarea
            id="description"
            className={sellStyles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          ></textarea>
        </div>

        <div className={sellStyles.formGroup}>
          <div className={sellStyles.checkboxGroup}>
            <input
              type="checkbox"
              id="isFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className={sellStyles.checkbox}
            />
            <label htmlFor="isFree" className={sellStyles.checkboxLabel}>無料ダウンロード</label>
          </div>
        </div>

        {!isFree && (
          <div className={sellStyles.formGroup}>
            <label htmlFor="price" className={sellStyles.label}>価格 (¥)</label>
            <input
              type="number"
              id="price"
              className={sellStyles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required={!isFree}
              min="0"
              step="0.01"
            />
          </div>
        )}

        <button type="submit" className={`${commonStyles.primaryButton} ${sellStyles.submitButton}`} disabled={loading}>
          {loading ? '送信中...' : '商品を出品する'}
        </button>
      </form>
    </main>
  );
}
