import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddToCartButton from './AddToCartButton';
import { server } from '../mocks/server';
import { supabase } from '@/lib/supabaseClient';

// MSWサーバーのセットアップ
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// supabase.auth.getUser() のモック
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
    rpc: jest.fn(() => ({
      select: jest.fn(() => ({
        throwOnError: jest.fn(() => Promise.resolve({ data: [{ quantity: 1 }], error: null })),
      })),
    })),
  },
}));

describe('AddToCartButton', () => {
  it('should add product to cart and display success message', async () => {
    render(<AddToCartButton productId="test-product-id" />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Product added to cart!')).toBeInTheDocument();
    });

    // RPC関数が正しく呼ばれたことを確認
    expect(supabase.rpc).toHaveBeenCalledWith(
      'add_or_increment_cart_item',
      {
        p_product_id: 'test-product-id',
        p_quantity_to_add: 1,
      }
    );
  });

  it('should display login message if user is not logged in', async () => {
    // ユーザーがログインしていない状態をモック
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null }, error: null });

    render(<AddToCartButton productId="test-product-id" />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Please log in to add items to your cart.')).toBeInTheDocument();
    });
  });

  it('should display error message on RPC failure', async () => {
    // RPC呼び出しがエラーを返す状態をモック
    (supabase.rpc as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        throwOnError: jest.fn(() => Promise.reject(new Error('Test RPC Error'))),
      })),
    });

    render(<AddToCartButton productId="test-product-id" />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Failed to add to cart: Test RPC Error/i)).toBeInTheDocument();
    });
  });
});
