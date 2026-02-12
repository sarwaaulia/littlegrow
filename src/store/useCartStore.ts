import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// tipe data di cart
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  categoryName?: string;
}

// tipe data untuk state
interface CartState {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, action: 'plus' | 'minus') => void;
  clearCart: () => void;
}

// middleware persist agar data di cart tidak hilang/agar sinkron
export const useCartStore = create<CartState>()(
  persist(
    // set untuk mengubah nilai state, get untuk mengambil nilai state
    (set, get) => ({
      items: [],

      // tambah barang di cart
      addItem: (product) => {

        // barang baru, jika belum ada di cart maka tambahkan
        const currentItems = get().items;

        // barang yang sudah ada di cart maka tambahkan jumlahnya
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          // jika barang sudah ada, tambah kuantitasnya dan cek stock nya
          if (existingItem.quantity < product.stock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            });
          }
        } else {
          // apabila barang baru di tambahkan ke cart maka hitung dari 1
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      // function untuk menghapus satu produk
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      // Fungsi update qty (tambah/kurang) langsung dari keranjang
      updateQty: (productId, action) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((item) => {
            if (item.id === productId) {
              const newQty = action === 'plus' ? item.quantity + 1 : item.quantity - 1;

              // validasi jika ingin update pembelian maka tidak boleh lebih dari stok dan kurang dari 1
              if (newQty > 0 && newQty <= item.stock) {
                return { ...item, quantity: newQty };
              }
            }
            return item;
          }),
        });
      },

      // bersihkan cart jika sudah checkout
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'littlegrow-cart-storage', // key di LocalStorage
      storage: createJSONStorage(() => localStorage), // simpan di LocalStorage
    }
  )
);