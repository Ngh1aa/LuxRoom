import fs from 'fs';
import path from 'path';

const files = [
  'about.html',
  'auth.html',
  'cart.html',
  'checkout.html',
  'compare.html',
  'contact.html',
  'detail.html',
  'index.html',
  'products.html',
  'profile.html',
  'rooms.html',
  'saved-room.html',
  'success.html',
  'tracking.html',
  'wishlist.html'
];

const standardTopbar = `<div class="topbar-actions">
      <button aria-label="Search" class="icon-button" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button>
      <a aria-label="Cart" class="icon-button" href="cart.html"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2 3h2l3 12h10l2-8H6"></path></svg><span class="cart-badge" data-cart-count style="display:none">0</span></a>
      <a aria-label="Wishlist" class="icon-button" href="wishlist.html"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg><span class="cart-badge" data-wishlist-count style="display:none">0</span></a>
      <a aria-label="Account" class="icon-button" href="auth.html"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></a>
    </div>`;

const root = process.cwd();

let modified = 0;

for (const file of files) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/<nav class="main-nav">/g, '<nav aria-label="Main menu" class="main-nav">');

  const topbarRegex = /<div[^>]*class="topbar-actions"[^>]*>[\s\S]*?<\/div>/;
  content = content.replace(topbarRegex, standardTopbar);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modified++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done. Modified ${modified} files.`);
