'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import commonStyles from '@/styles/common.module.css';
import cartStyles from './cart.module.css';
import Link from 'next/link';

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    sample_image_url: string;
  } | null;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('カートを見るにはログインしてください。');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products!inner(
            id,
            name,
            price,
            sample_image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        setError(`カートの読み込みに失敗しました: ${error.message}`);
      } else {
        setCartItems(data as CartItem[]);
      }
      setLoading(false);
    };

    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.products?.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  if (loading) {
    return <div className={commonStyles.container}><p className={commonStyles.loadingMessage}>カートを読み込み中...</p></div>;
  }

  if (error) {
    return <div className={commonStyles.container}><p className={commonStyles.errorMessage}>{error}</p></div>;
  }

  return (
    <main className={commonStyles.container}>
      <h1 className={cartStyles.heading}>あなたのショッピングカート</h1>
      {cartItems.length === 0 ? (
        <p className={cartStyles.emptyCartMessage}>カートは空です。<Link href="/">買い物を始める！</Link></p>
      ) : (
        <div className={cartStyles.cartContent}>
          <div className={cartStyles.cartItemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={cartStyles.cartItem}>
                <div className={cartStyles.itemImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.products?.sample_image_url || 'https://placehold.jp/3d4070/ffffff/100x100.png?text=Product'}
                    alt={item.products?.name || 'Product Image'}
                    className={cartStyles.itemImage}
                  />
                </div>
                <div className={cartStyles.itemDetails}>
                  <h2 className={cartStyles.itemName}>{item.products?.name}</h2>
                  <p className={cartStyles.itemPrice}>¥{(item.products?.price || 0).toLocaleString()}</p>
                </div>
                <div className={cartStyles.itemQuantityControls}>
                  <button className={cartStyles.quantityButton}>-</button>
                  <span className={cartStyles.quantityDisplay}>{item.quantity}</span>
                  <button className={cartStyles.quantityButton}>+</button>
                </div>
                <div className={cartStyles.itemSubtotal}>
                  ¥{((item.products?.price || 0) * item.quantity).toLocaleString()}
                </div>
                <button className={cartStyles.removeButton}>削除</button>
              </div>
            ))}
          </div>
          <div className={cartStyles.cartSummary}>
            <div className={cartStyles.summaryRow}>
              <span>小計:</span>
              <span>¥{calculateTotal().toLocaleString()}</span>
            </div>
            <div className={cartStyles.summaryRow}>
              <span>送料:</span>
              <span>無料</span>
            </div>
            <div className={`${cartStyles.summaryRow} ${cartStyles.totalRow}`}>
              <span>合計:</span>
              <span>¥{calculateTotal().toLocaleString()}</span>
            </div>
            <button className={`${commonStyles.primaryButton} ${cartStyles.checkoutButton}`}>レジに進む</button>
          </div>
        </div>
      )}
    </main>
  );
}
