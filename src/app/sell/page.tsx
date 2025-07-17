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
  const [plyFile, setPlyFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

    let fileUrl = '';
    const filePath = `${user.id}/${Date.now()}-${plyFile.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-models')
        .upload(filePath, plyFile, {
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

      // アップロードされたファイルの公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('product-models')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrlData.publicUrl;

    } catch (uploadError: any) {
      setError(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        sample_image_url: fileUrl, // アップロードされたファイルのURLを保存
        user_id: user.id,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push('/'); // 商品一覧ページへリダイレクト
    }
    setLoading(false);
  };

  return (
    <main className={sellStyles.container}>
      <h1 className={sellStyles.heading}>3DGSモデルを出品する</h1>
      <form onSubmit={handleSubmit} className={sellStyles.form}>
        {error && <p className={sellStyles.errorMessage}>{error}</p>}
        
        <div className={sellStyles.formGroup}>
          <label htmlFor="file-upload" className={sellStyles.label}>.plyファイル</label>
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
              onChange={handleFileChange}
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
          <label htmlFor="price" className={sellStyles.label}>価格 (¥)</label>
          <input
            type="number"
            id="price"
            className={sellStyles.input}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        {/* 画像URLの入力フィールドはファイルアップロードに置き換えられたため削除 */}
        {/* <div className={sellStyles.formGroup}>
          <label htmlFor="sampleImageUrl" className={sellStyles.label}>サンプル画像URL</label>
          <input
            type="url"
            id="sampleImageUrl"
            className={sellStyles.input}
            value={sampleImageUrl}
            onChange={(e) => setSampleImageUrl(e.target.value)}
            required
          />
        </div> */}
        <button type="submit" className={`${commonStyles.primaryButton} ${sellStyles.submitButton}`} disabled={loading}>
          {loading ? '送信中...' : '商品を出品する'}
        </button>
      </form>
    </main>
  );
}
