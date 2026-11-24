export type Locale = "en" | "fr" | "rw";
export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
];

/** English is the source of truth. Missing keys in another language fall back to English. */
const en = {
  "nav.home": "Home", "nav.shop": "Shop", "nav.chat": "Chat", "nav.cart": "Cart", "nav.account": "Account",
  "nav.signIn": "Sign In", "nav.getStarted": "Get Started", "nav.marketplace": "Marketplace",
  "nav.search": "Search for products, stores...", "nav.messages": "Messages", "nav.becomeSeller": "Become a seller",
  "nav.signOut": "Sign Out", "nav.dashboard": "Dashboard", "nav.myAccount": "My account", "nav.stores": "Stores",
  "cat.Home": "Home", "cat.Fashion": "Fashion", "cat.Beauty": "Beauty", "cat.Home & Living": "Home & Living", "cat.Detergents": "Detergents",
  "cat.Electronics": "Electronics", "cat.Supermarket": "Supermarket", "cat.Accessories": "Accessories", "cat.More": "More",
  "hero.tagline": "Shop Easy. Shop Smart.", "hero.line1": "Shop from", "hero.line2": "Different Stores", "hero.line3": "All in One Place",
  "hero.shopNow": "Shop Now", "hero.openStore": "Open Your Store",
  "auth.welcomeBack": "Welcome back", "auth.signInSub": "Sign in to your account", "auth.email": "Email", "auth.password": "Password",
  "auth.forgot": "Forgot password?", "auth.createOne": "Create one",
  "cart.title": "Your Cart", "cart.clear": "Clear all", "cart.empty": "Your cart is empty", "cart.browse": "Browse Marketplace",
  "cart.total": "Total", "cart.continue": "Continue Shopping", "cart.shipping": "Shipping",
  "home.recommended": "Recommended for you", "home.trending": "Trending now", "home.alsoBought": "Customers also bought",
  "acct.title": "My account", "acct.profile": "Profile", "acct.name": "Full name", "acct.phone": "Phone", "acct.save": "Save changes",
  "acct.security": "Security", "acct.currentPw": "Current password", "acct.newPw": "New password", "acct.changePw": "Change password",
  "acct.appearance": "Appearance", "acct.dark": "Dark mode", "acct.language": "Language", "acct.notifications": "Notifications",
  "acct.enablePush": "Enable notifications on this device", "acct.disablePush": "Turn off notifications on this device",
};

const fr: Partial<Record<keyof typeof en, string>> = {
  "nav.home": "Accueil", "nav.shop": "Boutique", "nav.chat": "Messages", "nav.cart": "Panier", "nav.account": "Compte",
  "nav.signIn": "Connexion", "nav.getStarted": "Commencer", "nav.marketplace": "Marché",
  "nav.search": "Rechercher des produits, boutiques...", "nav.messages": "Messages", "nav.becomeSeller": "Devenir vendeur",
  "nav.signOut": "Déconnexion", "nav.dashboard": "Tableau de bord", "nav.myAccount": "Mon compte", "nav.stores": "Boutiques",
  "cat.Home": "Accueil", "cat.Fashion": "Mode", "cat.Beauty": "Beauté", "cat.Home & Living": "Maison", "cat.Detergents": "Détergents",
  "cat.Electronics": "Électronique", "cat.Supermarket": "Supermarché", "cat.Accessories": "Accessoires", "cat.More": "Plus",
  "hero.tagline": "Achetez facile. Achetez malin.", "hero.line1": "Achetez dans", "hero.line2": "différentes boutiques", "hero.line3": "au même endroit",
  "hero.shopNow": "Acheter", "hero.openStore": "Ouvrir ma boutique",
  "auth.welcomeBack": "Bon retour", "auth.signInSub": "Connectez-vous à votre compte", "auth.email": "E-mail", "auth.password": "Mot de passe",
  "auth.forgot": "Mot de passe oublié ?", "auth.createOne": "Créer un compte",
  "cart.title": "Votre panier", "cart.clear": "Tout vider", "cart.empty": "Votre panier est vide", "cart.browse": "Parcourir le marché",
  "cart.total": "Total", "cart.continue": "Continuer mes achats", "cart.shipping": "Livraison",
  "home.recommended": "Recommandé pour vous", "home.trending": "Tendances", "home.alsoBought": "Les clients ont aussi acheté",
  "acct.title": "Mon compte", "acct.profile": "Profil", "acct.name": "Nom complet", "acct.phone": "Téléphone", "acct.save": "Enregistrer",
  "acct.security": "Sécurité", "acct.currentPw": "Mot de passe actuel", "acct.newPw": "Nouveau mot de passe", "acct.changePw": "Changer le mot de passe",
  "acct.appearance": "Apparence", "acct.dark": "Mode sombre", "acct.language": "Langue", "acct.notifications": "Notifications",
  "acct.enablePush": "Activer les notifications sur cet appareil", "acct.disablePush": "Désactiver les notifications sur cet appareil",
};

// Kinyarwanda — please have a native speaker review wording before launch.
const rw: Partial<Record<keyof typeof en, string>> = {
  "nav.home": "Ahabanza", "nav.shop": "Isoko", "nav.chat": "Ubutumwa", "nav.cart": "Igikapu", "nav.account": "Konti",
  "nav.signIn": "Injira", "nav.getStarted": "Tangira", "nav.marketplace": "Isoko",
  "nav.search": "Shakisha ibicuruzwa, amaduka...", "nav.messages": "Ubutumwa", "nav.becomeSeller": "Ba umucuruzi",
  "nav.signOut": "Sohoka", "nav.dashboard": "Ikibaho", "nav.myAccount": "Konti yanjye", "nav.stores": "Amaduka",
  "cat.Home": "Ahabanza", "cat.Fashion": "Imideli", "cat.Beauty": "Ubwiza", "cat.Home & Living": "Urugo", "cat.Detergents": "Isabune n'ibikoresho",
  "cat.Electronics": "Ibikoresho by'amashanyarazi", "cat.Supermarket": "Supermarket", "cat.Accessories": "Ibikoresho by'umurimbo", "cat.More": "Ibindi",
  "hero.tagline": "Gura byoroshye. Gura neza.", "hero.line1": "Gura mu", "hero.line2": "maduka atandukanye", "hero.line3": "ahantu hamwe",
  "hero.shopNow": "Gura ubu", "hero.openStore": "Fungura iduka ryawe",
  "auth.welcomeBack": "Karibu mu rugo", "auth.signInSub": "Injira muri konti yawe", "auth.email": "Imeri", "auth.password": "Ijambobanga",
  "auth.forgot": "Wibagiwe ijambobanga?", "auth.createOne": "Fungura konti",
  "cart.title": "Igikapu cyawe", "cart.clear": "Kuramo byose", "cart.empty": "Igikapu cyawe kirimo ubusa", "cart.browse": "Reba isoko",
  "cart.total": "Yose hamwe", "cart.continue": "Komeza kugura", "cart.shipping": "Gutwara",
  "home.recommended": "Bikuberanye", "home.trending": "Bishakishwa cyane", "home.alsoBought": "Abakiriya bagura na",
  "acct.title": "Konti yanjye", "acct.profile": "Umwirondoro", "acct.name": "Amazina yombi", "acct.phone": "Telefone", "acct.save": "Bika impinduka",
  "acct.security": "Umutekano", "acct.currentPw": "Ijambobanga ririho", "acct.newPw": "Ijambobanga rishya", "acct.changePw": "Hindura ijambobanga",
  "acct.appearance": "Imiterere", "acct.dark": "Ibara ry'umwijima", "acct.language": "Ururimi", "acct.notifications": "Amatangazo",
  "acct.enablePush": "Emera amatangazo kuri iki gikoresho", "acct.disablePush": "Hagarika amatangazo kuri iki gikoresho",
};

export type TKey = keyof typeof en;
export const DICTS: Record<Locale, Partial<Record<TKey, string>>> = { en, fr, rw };
