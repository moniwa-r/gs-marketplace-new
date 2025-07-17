import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import productDetailStyles from './productDetail.module.css';
import commonStyles from '@/styles/common.module.css';
import AddToCartButton from '@/components/AddToCartButton';
// import React from 'react'; // Reactのインポートを削除

export const revalidate = 60; // ページの再検証時間を設定

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sample_image_url: string;
  thumbnail_urls: string[]; // サムネイルURLの配列を追加
}

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*, thumbnail_urls').eq('id', id).single(); // thumbnail_urlsも取得
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // paramsを直接使用するように戻す
  const productId = params.id;

  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className={productDetailStyles.container}>
      <div className={productDetailStyles.productDetailCard}>
        <div className={productDetailStyles.imageSection}>
          <div className={productDetailStyles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnail_urls && product.thumbnail_urls.length > 0 
                ? product.thumbnail_urls[0] 
                : product.sample_image_url || 'https://placehold.jp/3d4070/ffffff/600x400.png?text=Sample'} // サムネイルを優先
              alt={product.name}
              className={productDetailStyles.productImage}
            />
          </div>
          {/* 他のサムネイルを表示するギャラリーなどをここに追加できます */}
          {product.thumbnail_urls && product.thumbnail_urls.length > 1 && (
            <div className={productDetailStyles.thumbnailGallery}>
              {product.thumbnail_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={productDetailStyles.thumbnailGalleryImage}
                />
              ))}
            </div>
          )}
        </div>
        <div className={productDetailStyles.infoSection}>
          <div>
            <h1 className={productDetailStyles.productTitle}>{product.name}</h1>
            <p className={productDetailStyles.productDescription}>{product.description}</p>
          </div>
          <div className={productDetailStyles.priceSection}>
            <p className={productDetailStyles.productPrice}>¥{product.price.toLocaleString()}</p>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
