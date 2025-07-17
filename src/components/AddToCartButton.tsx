'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import commonStyles from '@/styles/common.module.css';
import productDetailStyles from '@/app/products/[id]/productDetail.module.css';

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage('カートに追加するにはログインしてください。');
      setAddingToCart(false);
      return;
    }

    try {
      const res = await supabase.rpc('add_or_increment_cart_item', {
        p_product_id: productId,
        p_quantity_to_add: 1,
      }).select('*');

      if (res.error) {
        console.error('RPC Error:', res.error);
        console.error('Error details:', res.error.details);
        console.error('Error hint:', res.error.hint);
        console.error('Error message:', res.error.message);

        let userMessage = 'カートへの追加に失敗しました。';
        const errorCode = res.error.code;

        switch (errorCode) {
          case '23503': // Foreign Key Violation
            userMessage = '商品またはユーザーが見つかりません。後でもう一度お試しください。';
            break;
          case '42501': // RLS Policy Violation
            userMessage = 'この操作を実行する権限がありません。';
            break;
          case '23505': // Unique Constraint Violation
            userMessage = 'この商品はすでにカートに入っています。';
            break;
          default:
            userMessage = `カートへの追加に失敗しました: ${res.error.message || JSON.stringify(res.error)}`;
            break;
        }
        setMessage(userMessage);
        return; 
      } else {
        if (res.data && res.data.length > 0 && res.data[0].quantity > 1) {
          setMessage('カート内の商品の数量を更新しました！');
        } else {
          setMessage('商品をカートに追加しました！');
        }
      }
    } catch (error: any) {
      console.error('Caught error:', error);
      setMessage('カートへの追加に失敗しました');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        className={`${commonStyles.primaryButton} ${productDetailStyles.buyButton}`}
        disabled={addingToCart}
      >
        {addingToCart ? '追加中...' : 'カートに追加'}
      </button>
      {message && <p className={productDetailStyles.message}>{message}</p>}
    </>
  );
}