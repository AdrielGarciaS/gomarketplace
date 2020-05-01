import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    updateStorage();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const existsProduct = products.findIndex(p => p.id === product.id);

      const data = [...products];

      if (existsProduct >= 0) {
        data[existsProduct].quantity += 1;
      } else {
        data.push({ ...product, quantity: 1 });
      }

      setProducts(data);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const existsProduct = products.findIndex(p => p.id === id);

      const data = [...products];

      data[existsProduct].quantity += 1;

      setProducts(data);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      const data = [...products];

      if (data[productIndex].quantity - 1 > 0) {
        data[productIndex].quantity -= 1;
      } else {
        data.splice(productIndex, 1);
      }

      setProducts(data);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
