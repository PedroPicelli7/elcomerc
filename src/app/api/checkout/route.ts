// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/services/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  
  try {
    // 1. Verifica se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const { cartItems, deliveryCity, deliveryAddress } = await request.json();

    if (!cartItems || cartItems.length === 0 || !deliveryCity || !deliveryAddress) {
      return NextResponse.json({ error: "Dados incompletos para fechar o pedido." }, { status: 400 });
    }

    // 2. Busca as regras de frete oficiais do banco para a cidade escolhida
    const { data: shippingRule, error: shipError } = await supabase
      .from("shipping_rules")
      .select("*")
      .eq("city_name", deliveryCity)
      .single();

    if (shipError || !shippingRule) {
      return NextResponse.json({ error: "Região de entrega não atendida ou não encontrada." }, { status: 400 });
    }

    // 3. Busca os produtos direto do banco para garantir integridade dos preços e pesos
    const productIds = cartItems.map((item: any) => item.product.id);
    const { data: dbProducts, error: prodError } = await supabase
      .from("products")
      .select("id, name, price, weight, stock")
      .in("id", productIds);

    if (prodError || !dbProducts) {
      return NextResponse.json({ error: "Erro ao validar produtos do carrinho." }, { status: 500 });
    }

    let subtotal = 0;
    let totalWeight = 0;
    const orderItemsToInsert: any[] = [];
    const stockUpdates: any[] = [];

    // 4. Cruza os dados do carrinho com o Banco de Dados
    for (const item of cartItems) {
      const dbProd = dbProducts.find((p) => p.id === item.product.id);
      
      if (!dbProd) {
        return NextResponse.json({ error: `Produto ${item.product.name} não encontrado.` }, { status: 400 });
      }

      if (dbProd.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para o item: ${dbProd.name}.` }, { status: 400 });
      }

      const itemPrice = Number(dbProd.price);
      subtotal += itemPrice * item.quantity;
      totalWeight += Number(dbProd.weight) * item.quantity;

      orderItemsToInsert.push({
        product_id: dbProd.id,
        quantity: item.quantity,
        price_at_purchase: itemPrice,
      });

      // Prepara a baixa de estoque
      stockUpdates.push({
        id: dbProd.id,
        new_stock: dbProd.stock - item.quantity,
      });
    }

    // 5. Calcula o valor exato do frete
    const baseFee = Number(shippingRule.base_fee);
    const perKgFee = Number(shippingRule.per_kg_fee);
    const shippingCost = baseFee + (totalWeight / 1000) * perKgFee;
    const totalGeral = subtotal + shippingCost;

    // 6. Grava o Pedido Principal (Tabela orders)
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total_weight: totalWeight,
        total: totalGeral,
        delivery_city: deliveryCity,
        delivery_address: deliveryAddress,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      throw new Error(`Erro ao gerar cabeçalho do pedido: ${orderError?.message}`);
    }

    // 7. Grava os Itens do Pedido vinculados ao ID gerado (Tabela order_items)
    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) throw new Error(`Erro ao salvar itens do pedido: ${itemsError.message}`);

    // 8. Atualiza o estoque físico de cada peça (Baixa automática)
    for (const update of stockUpdates) {
      await supabase
        .from("products")
        .update({ stock: update.new_stock })
        .eq("id", update.id);
    }

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("Erro crítico no Checkout:", error);
    return NextResponse.json({ error: error.message || "Erro interno no checkout" }, { status: 500 });
  }
}