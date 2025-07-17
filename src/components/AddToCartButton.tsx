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
      setMessage('Please log in to add items to your cart.');
      setAddingToCart(false);
      return;
    }

    try {
      // .single() を削除し、配列として受け取る
      const { data, error } = await supabase
        .rpc('add_or_increment_cart_item', {
          p_product_id: productId,
          p_quantity_to_add: 1
        })
        .select('*');
      
      if (error) {
        console.error('RPC Error:', error);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error message:', error.message);

        let userMessage = 'Failed to add to cart.';
        const errorCode = error.code;

        switch (errorCode) {
          case '23503': // Foreign Key Violation
            userMessage = 'Product or user not found. Please try again later.';
            break;
          case '42501': // RLS Policy Violation
            userMessage = 'You do not have permission to perform this action.';
            break;
          case '23505': // Unique Constraint Violation
            userMessage = 'This item is already in your cart.';
            break;
          default:
            userMessage = `Failed to add to cart: ${error.message || JSON.stringify(error)}`;
            break;
        }
        setMessage(userMessage);
        return; // エラーの場合はここで処理を終了
      }
      
      // data は配列なので、最初の要素を取得
      const cartItem = data[0];
      
      if (cartItem) {
        // 数量に応じてメッセージを出し分け
        if (cartItem.quantity === 1) {
          setMessage('Product added to cart!');
        } else {
          setMessage(`Product quantity updated in cart! (${cartItem.quantity})`);
        }
      }
      
    } catch (err: any) {
      console.error('Caught error:', err);
      setMessage('Failed to add item to cart');
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
        {addingToCart ? 'Adding...' : 'Add to Cart'}
      </button>
      {message && <p className={productDetailStyles.message}>{message}</p>}
    </>
  );
}
