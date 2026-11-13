/*
 * LuxRoom store seed — the single data file for every piece of user data.
 *
 * There is no server. On the first page view in a browser tab, js/common.js copies
 * this seed into sessionStorage. From then on every flow (cart, wishlist, saved
 * rooms, orders, account, addresses, reviews…) reads and writes sessionStorage, so
 * state survives navigation and reload in the same tab and disappears when the tab
 * closes. "Reset demo data" in the hidden demo tools panel (open with ?demo=1) restores this seed.
 *
 * Orders here are seed records. No payment is taken and nothing is delivered.
 */
window.LUXROOM_SEED = {
  version: 1,

  // The seeded customer. Visitors arrive signed in as this account; after signing out,
  // the sign-in page offers "Continue as Linh Tran" and still accepts these credentials.
  users: [
    {
      id: "u-linh",
      name: "Linh Tran",
      email: "linh.tran@luxroom.vn",
      password: "luxroom123",
      phone: "+84 901 234 567",
      preferences: "Soft textures, quiet colour, natural oak.",
    },
  ],

  // Signed-in user id, or null for a guest. Visitors start signed in as the seeded customer.
  session: "u-linh",

  addresses: [
    {
      id: "addr-1",
      userId: "u-linh",
      label: "Home",
      fullName: "Linh Tran",
      phone: "+84 901 234 567",
      address: "12 Nguyen Hue Boulevard, Apt 8.04",
      ward: "Ben Nghe",
      district: "District 1",
      province: "Ho Chi Minh City",
      isDefault: true,
    },
    {
      id: "addr-2",
      userId: "u-linh",
      label: "Studio",
      fullName: "Linh Tran",
      phone: "+84 901 234 567",
      address: "45 Tran Phu Street",
      ward: "Hai Chau 1",
      district: "Hai Chau",
      province: "Da Nang",
      isDefault: false,
    },
  ],

  // Orders that belong to the seeded customer. Items reference catalogue ids.
  orders: [
    {
      id: "LR-6020192",
      userId: "u-linh",
      daysAgo: 16,
      status: "Delivered",
      items: [{ productId: 1, variantId: "1-1", sizeId: "std", quantity: 1 }],
      address: { fullName: "Linh Tran", address: "12 Nguyen Hue Boulevard, Apt 8.04", ward: "Ben Nghe", district: "District 1", province: "Ho Chi Minh City" },
      contact: { email: "linh.tran@luxroom.vn", phone: "+84 901 234 567" },
      delivery: { method: "room", methodLabel: "Room delivery", slot: "Morning, 08:00–12:00", deliveredDaysAgo: 6 },
      payment: { method: "Pay on delivery" },
      promo: null,
      timelineStep: 5,
    },
    {
      id: "LR-6110115",
      userId: "u-linh",
      daysAgo: 3,
      status: "Processing",
      items: [
        { productId: 11, variantId: "11-1", sizeId: "std", quantity: 2 },
        { productId: 13, variantId: "13-1", sizeId: "std", quantity: 1 },
      ],
      address: { fullName: "Linh Tran", address: "45 Tran Phu Street", ward: "Hai Chau 1", district: "Hai Chau", province: "Da Nang" },
      contact: { email: "linh.tran@luxroom.vn", phone: "+84 901 234 567" },
      delivery: { method: "placement", methodLabel: "Room delivery + placement", slot: "Afternoon, 13:00–17:00" },
      payment: { method: "Bank transfer" },
      promo: null,
      timelineStep: 1,
    },
  ],

  cart: [],
  savedForLater: [],
  wishlist: [],
  compare: [],

  savedRooms: [
    {
      id: "room-1",
      name: "Living room",
      type: "Living",
      measurements: { width: "420", depth: "360", doorway: "88", clearance: "60" },
      items: [{ productId: 12, variantId: "12-1" }, { productId: 9, variantId: "9-1" }],
    },
  ],
  activeRoomId: "room-1",

  // Codes the cart accepts. Anything else is rejected with a clear message.
  promoCodes: {
    WELCOME10: { type: "percent", value: 10, label: "10% off objects" },
    STUDIO50: { type: "amount", value: 50, minSubtotal: 500, label: "$50 off orders over $500" },
    SUMMER24: { type: "percent", value: 15, expired: true, label: "Summer 2024 edit" },
  },

  // Seeded reviews by product id. Visitors can add more; they live in the same tab only.
  reviews: {
    1: [
      { id: "r-1-1", name: "Minh A.", rating: 5, date: "2026-09-02", title: "Softer than it looks", body: "Low and deep without swallowing you. The olive bouclé reads warmer in daylight than in the photos." },
      { id: "r-1-2", name: "Claire D.", rating: 4, date: "2026-07-18", title: "Measure the doorway", body: "Beautiful chair. It only just cleared our 80 cm doorway, so check the delivery path first." },
    ],
    3: [
      { id: "r-3-1", name: "Huy N.", rating: 5, date: "2026-08-11", title: "Seats eight comfortably", body: "The oil finish takes daily use well. Worth the made-to-order wait." },
    ],
    8: [
      { id: "r-8-1", name: "Thao P.", rating: 4, date: "2026-06-30", title: "Deep, modular, honest", body: "We started with the 3-seat size and plan to add a module later. Linen pills a little in the first month." },
      { id: "r-8-2", name: "Ben K.", rating: 5, date: "2026-05-14", title: "Placement service was calm", body: "The team brought it up five floors and removed every piece of packaging." },
    ],
    12: [
      { id: "r-12-1", name: "Mai L.", rating: 5, date: "2026-09-20", title: "Right size for an apartment", body: "Fits under the window with room to walk past. Cushions keep their shape." },
    ],
    13: [
      { id: "r-13-1", name: "Quang V.", rating: 4, date: "2026-10-01", title: "Warm evening light", body: "Glaze is lovely. The cable is shorter than I expected." },
    ],
  },

  recentlyViewed: [],
};
