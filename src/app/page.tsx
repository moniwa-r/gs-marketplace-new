'use client';

import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import commonStyles from '@/styles/common.module.css';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';



interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sample_image_url: string;
}

async function getProducts(searchTerm: string | null): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearchTerm = searchParams.get('search');
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const fetchedProducts = await getProducts(initialSearchTerm);
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, [initialSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchTerm) {
      current.set('search', searchTerm);
    } else {
      current.delete('search');
    }
    const query = current.toString();
    router.push(`/?${query}`);
  };

  return (
    <main className={commonStyles.container}>
      <h1 className={commonStyles.heading1}>Explore 3DGS Models</h1>
      <form onSubmit={handleSearchSubmit} className={commonStyles.searchForm}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={commonStyles.searchInput}
        />
        <button type="submit" className={commonStyles.searchButton}>Search</button>
      </form>
      {loading ? (
        <p className={commonStyles.loadingMessage}>Loading products...</p>
      ) : products.length === 0 ? (
        <p className={commonStyles.noProductsMessage}>No products found.</p>
      ) : (
        <div className={commonStyles.gridContainer}>
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <div className={commonStyles.card}>
                <div className={commonStyles.cardImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.sample_image_url || 'https://placehold.jp/3d4070/ffffff/400x300.png?text=Sample'}
                    alt={product.name}
                    className={commonStyles.cardImage}
                  />
                </div>
                <div className={commonStyles.cardContent}>
                  <h2 className={commonStyles.cardTitle}>{product.name}</h2>
                  <p className={commonStyles.cardDescription}>{product.description}</p>
                </div>
                <div className={commonStyles.cardFooter}>
                  <p className={commonStyles.cardPrice}>¥{product.price.toLocaleString()}</p>
                  <button className={commonStyles.primaryButton}>View Details</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
