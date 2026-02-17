import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// data type in cart
interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	quantity: number;
	stock: number;
	categoryName?: string;
	userId: string;
}

// data type for state
interface CartState {
	items: CartItem[];
	addItem: (product: CartItem, userId: string) => void;
	removeItem: (productId: string, userId: string) => void;
	updateQty: (
		productId: string,
		action: "plus" | "minus",
		userId: string,
	) => void;
	clearCart: (userId: string) => void;
}

// middleware persist for sync data so that data is not lost
export const useCartStore = create<CartState>()(
	persist(
		// set to change the state value, get to get the state value
		(set, get) => ({
			items: [],
			// adding new product to cart
			addItem: (product, userId) => {
				// if the product is new added
				const currentItems = get().items;

				// if items is in cart, add the amount
				const existingItem = currentItems.find(
					(item) => item.id === product.id && item.userId === userId,
				);

				if (existingItem) {
					// if the item is already available, increase the quantity and check the stock.
					if (existingItem.quantity < product.stock) {
						set({
							items: currentItems.map((item) =>
								item.id === product.id && item.userId === userId
									? { ...item, quantity: item.quantity + 1 }
									: item,
							),
						});
					}
				} else {
					// if a new item is added to the cart then count from 1
					set({
						items: [...currentItems, { ...product, quantity: 1, userId }],
					});
				}
			},

			// function for remove one product
			removeItem: (productId, userId) => {
				set({
					items: get().items.filter(
						(item) => !(item.id === productId && item.userId === userId),
					),
				});
			},

			// function update quantity, dec/inc
			updateQty: (productId, action, userId) => {
				set({
					items: get().items.map((item) => {
						if (item.id === productId && item.userId === userId) {
							const newQty =
								action === "plus" ? item.quantity + 1 : item.quantity - 1;
							if (newQty > 0 && newQty <= item.stock) {
								return { ...item, quantity: newQty };
							}
						}
						return item;
					}),
				});
			},

			// clear cart
			clearCart: (userId) => {
				// Hanya hapus barang milik user ini, sisakan barang milik user lain
				set({ items: get().items.filter((item) => item.userId !== userId) });
			},
		}),
		{
			name: "littlegrow-cart-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
