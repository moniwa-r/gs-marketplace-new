'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import sellStyles from './sell.module.css';
import commonStyles from '@/styles/common.module.css';

export default function SellPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sampleImageUrl, setSampleImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to sell a product.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: parseFloat(price),
        sample_image_url: sampleImageUrl,
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
      <h1 className={sellStyles.heading}>Sell Your 3DGS Model</h1>
      <form onSubmit={handleSubmit} className={sellStyles.form}>
        {error && <p className={sellStyles.errorMessage}>{error}</p>}
        <div className={sellStyles.formGroup}>
          <label htmlFor="name" className={sellStyles.label}>Product Name</label>
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
          <label htmlFor="description" className={sellStyles.label}>Description</label>
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
          <label htmlFor="price" className={sellStyles.label}>Price (¥)</label>
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
        <div className={sellStyles.formGroup}>
          <label htmlFor="sampleImageUrl" className={sellStyles.label}>Sample Image URL</label>
          <input
            type="url"
            id="sampleImageUrl"
            className={sellStyles.input}
            value={sampleImageUrl}
            onChange={(e) => setSampleImageUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={`${commonStyles.primaryButton} ${sellStyles.submitButton}`} disabled={loading}>
          {loading ? 'Submitting...' : 'List Product'}
        </button>
      </form>
    </main>
  );
}
