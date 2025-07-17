import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://ulbaprxuiommjlgdxize.supabase.co/rest/v1/rpc/add_or_increment_cart_item', async ({ request }) => {
    // Prefer ヘッダーの検証
    if (request.headers.get('Prefer') !== 'return=representation') {
      return HttpResponse.json(
        { message: 'Invalid Prefer header' },
        { status: 400 }
      );
    }

    // リクエストボディの検証 (オプション)
    const body = await request.json();
    if (!body.p_product_id || !body.p_quantity_to_add) {
      return HttpResponse.json(
        { message: 'Missing p_product_id or p_quantity_to_add' },
        { status: 400 }
      );
    }

    // 成功レスポンスのモック
    return HttpResponse.json(
      [
        {
          id: 'mock-cart-item-id',
          user_id: 'mock-user-id',
          product_id: body.p_product_id,
          quantity: body.p_quantity_to_add,
        },
      ],
      { status: 200 }
    );
  }),
];
