import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'pt' | 'ar' | 'tr' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.services': 'Services',
    'nav.orders': 'My Orders',
    'nav.deposit': 'Add Funds',
    'nav.support': 'Support',
    'nav.profile': 'Profile',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.refresh': 'Refresh',
    'common.all': 'All',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.subtitle': 'Track and manage your orders',
    'orders.pending': 'Pending',
    'orders.in_progress': 'In Progress',
    'orders.completed': 'Completed',
    'orders.cancelled': 'Cancelled',
    'orders.partial': 'Partial',
    'orders.no_orders': 'No orders found',
    
    // Services
    'services.title': 'Services',
    'services.subtitle': 'Browse and order SMM services',
    'services.categories': 'Categories',
    'services.add_to_cart': 'Add to Cart',
    'services.order_now': 'Order Now',
    'services.favorites': 'Favorites',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout All',
    'cart.total': 'Total',
    'cart.clear': 'Clear Cart',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your account settings',
    'profile.balance': 'Balance',
    'profile.total_spent': 'Total Spent',
    'profile.referrals': 'Referrals',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark all read',
    'notifications.empty': 'No notifications',
    'notifications.order_update': 'Order Update',
    'notifications.low_balance': 'Low Balance',
    
    // Deposit
    'deposit.title': 'Add Funds',
    'deposit.subtitle': 'Top up your account balance',
    'deposit.amount': 'Amount',
    'deposit.method': 'Payment Method',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.services': 'Servicios',
    'nav.orders': 'Mis Pedidos',
    'nav.deposit': 'Agregar Fondos',
    'nav.support': 'Soporte',
    'nav.profile': 'Perfil',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.refresh': 'Actualizar',
    'common.all': 'Todos',
    
    // Orders
    'orders.title': 'Mis Pedidos',
    'orders.subtitle': 'Rastrea y gestiona tus pedidos',
    'orders.pending': 'Pendiente',
    'orders.in_progress': 'En Progreso',
    'orders.completed': 'Completado',
    'orders.cancelled': 'Cancelado',
    'orders.partial': 'Parcial',
    'orders.no_orders': 'No se encontraron pedidos',
    
    // Services
    'services.title': 'Servicios',
    'services.subtitle': 'Explora y ordena servicios SMM',
    'services.categories': 'Categorías',
    'services.add_to_cart': 'Agregar al Carrito',
    'services.order_now': 'Ordenar Ahora',
    'services.favorites': 'Favoritos',
    
    // Cart
    'cart.title': 'Carrito de Compras',
    'cart.empty': 'Tu carrito está vacío',
    'cart.checkout': 'Pagar Todo',
    'cart.total': 'Total',
    'cart.clear': 'Vaciar Carrito',
    
    // Profile
    'profile.title': 'Mi Perfil',
    'profile.subtitle': 'Administra tu cuenta',
    'profile.balance': 'Saldo',
    'profile.total_spent': 'Total Gastado',
    'profile.referrals': 'Referidos',
    
    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.mark_all_read': 'Marcar todo leído',
    'notifications.empty': 'Sin notificaciones',
    'notifications.order_update': 'Actualización de Pedido',
    'notifications.low_balance': 'Saldo Bajo',
    
    // Deposit
    'deposit.title': 'Agregar Fondos',
    'deposit.subtitle': 'Recarga tu saldo',
    'deposit.amount': 'Cantidad',
    'deposit.method': 'Método de Pago',
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.services': 'Serviços',
    'nav.orders': 'Meus Pedidos',
    'nav.deposit': 'Adicionar Fundos',
    'nav.support': 'Suporte',
    'nav.profile': 'Perfil',
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.refresh': 'Atualizar',
    'common.all': 'Todos',
    'orders.title': 'Meus Pedidos',
    'orders.subtitle': 'Acompanhe e gerencie seus pedidos',
    'orders.pending': 'Pendente',
    'orders.in_progress': 'Em Progresso',
    'orders.completed': 'Concluído',
    'orders.cancelled': 'Cancelado',
    'orders.partial': 'Parcial',
    'orders.no_orders': 'Nenhum pedido encontrado',
    'services.title': 'Serviços',
    'services.subtitle': 'Navegue e peça serviços SMM',
    'services.categories': 'Categorias',
    'services.add_to_cart': 'Adicionar ao Carrinho',
    'services.order_now': 'Pedir Agora',
    'services.favorites': 'Favoritos',
    'cart.title': 'Carrinho de Compras',
    'cart.empty': 'Seu carrinho está vazio',
    'cart.checkout': 'Finalizar Compra',
    'cart.total': 'Total',
    'cart.clear': 'Limpar Carrinho',
    'profile.title': 'Meu Perfil',
    'profile.subtitle': 'Gerencie suas configurações',
    'profile.balance': 'Saldo',
    'profile.total_spent': 'Total Gasto',
    'profile.referrals': 'Indicações',
    'notifications.title': 'Notificações',
    'notifications.mark_all_read': 'Marcar tudo como lido',
    'notifications.empty': 'Sem notificações',
    'notifications.order_update': 'Atualização do Pedido',
    'notifications.low_balance': 'Saldo Baixo',
    'deposit.title': 'Adicionar Fundos',
    'deposit.subtitle': 'Recarregue seu saldo',
    'deposit.amount': 'Valor',
    'deposit.method': 'Método de Pagamento',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.services': 'الخدمات',
    'nav.orders': 'طلباتي',
    'nav.deposit': 'إضافة رصيد',
    'nav.support': 'الدعم',
    'nav.profile': 'الملف الشخصي',
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.submit': 'إرسال',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.refresh': 'تحديث',
    'common.all': 'الكل',
    'orders.title': 'طلباتي',
    'orders.subtitle': 'تتبع وإدارة طلباتك',
    'orders.pending': 'قيد الانتظار',
    'orders.in_progress': 'قيد التنفيذ',
    'orders.completed': 'مكتمل',
    'orders.cancelled': 'ملغي',
    'orders.partial': 'جزئي',
    'orders.no_orders': 'لا توجد طلبات',
    'services.title': 'الخدمات',
    'services.subtitle': 'تصفح واطلب خدمات SMM',
    'services.categories': 'الفئات',
    'services.add_to_cart': 'أضف إلى السلة',
    'services.order_now': 'اطلب الآن',
    'services.favorites': 'المفضلة',
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.checkout': 'إتمام الشراء',
    'cart.total': 'المجموع',
    'cart.clear': 'إفراغ السلة',
    'profile.title': 'ملفي الشخصي',
    'profile.subtitle': 'إدارة إعدادات حسابك',
    'profile.balance': 'الرصيد',
    'profile.total_spent': 'إجمالي الإنفاق',
    'profile.referrals': 'الإحالات',
    'notifications.title': 'الإشعارات',
    'notifications.mark_all_read': 'تحديد الكل كمقروء',
    'notifications.empty': 'لا توجد إشعارات',
    'notifications.order_update': 'تحديث الطلب',
    'notifications.low_balance': 'رصيد منخفض',
    'deposit.title': 'إضافة رصيد',
    'deposit.subtitle': 'شحن رصيد حسابك',
    'deposit.amount': 'المبلغ',
    'deposit.method': 'طريقة الدفع',
  },
  tr: {
    'nav.dashboard': 'Panel',
    'nav.services': 'Hizmetler',
    'nav.orders': 'Siparişlerim',
    'nav.deposit': 'Bakiye Ekle',
    'nav.support': 'Destek',
    'nav.profile': 'Profil',
    'common.loading': 'Yükleniyor...',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.submit': 'Gönder',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.export': 'Dışa Aktar',
    'common.refresh': 'Yenile',
    'common.all': 'Tümü',
    'orders.title': 'Siparişlerim',
    'orders.subtitle': 'Siparişlerinizi takip edin',
    'orders.pending': 'Beklemede',
    'orders.in_progress': 'İşleniyor',
    'orders.completed': 'Tamamlandı',
    'orders.cancelled': 'İptal Edildi',
    'orders.partial': 'Kısmi',
    'orders.no_orders': 'Sipariş bulunamadı',
    'services.title': 'Hizmetler',
    'services.subtitle': 'SMM hizmetlerini keşfedin',
    'services.categories': 'Kategoriler',
    'services.add_to_cart': 'Sepete Ekle',
    'services.order_now': 'Şimdi Sipariş Ver',
    'services.favorites': 'Favoriler',
    'cart.title': 'Alışveriş Sepeti',
    'cart.empty': 'Sepetiniz boş',
    'cart.checkout': 'Ödeme Yap',
    'cart.total': 'Toplam',
    'cart.clear': 'Sepeti Temizle',
    'profile.title': 'Profilim',
    'profile.subtitle': 'Hesap ayarlarını yönet',
    'profile.balance': 'Bakiye',
    'profile.total_spent': 'Toplam Harcama',
    'profile.referrals': 'Referanslar',
    'notifications.title': 'Bildirimler',
    'notifications.mark_all_read': 'Tümünü okundu işaretle',
    'notifications.empty': 'Bildirim yok',
    'notifications.order_update': 'Sipariş Güncellemesi',
    'notifications.low_balance': 'Düşük Bakiye',
    'deposit.title': 'Bakiye Ekle',
    'deposit.subtitle': 'Hesabınızı yükleyin',
    'deposit.amount': 'Tutar',
    'deposit.method': 'Ödeme Yöntemi',
  },
  ru: {
    'nav.dashboard': 'Панель',
    'nav.services': 'Услуги',
    'nav.orders': 'Мои заказы',
    'nav.deposit': 'Пополнить',
    'nav.support': 'Поддержка',
    'nav.profile': 'Профиль',
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.submit': 'Отправить',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.export': 'Экспорт',
    'common.refresh': 'Обновить',
    'common.all': 'Все',
    'orders.title': 'Мои заказы',
    'orders.subtitle': 'Отслеживайте свои заказы',
    'orders.pending': 'Ожидает',
    'orders.in_progress': 'В процессе',
    'orders.completed': 'Завершён',
    'orders.cancelled': 'Отменён',
    'orders.partial': 'Частичный',
    'orders.no_orders': 'Заказы не найдены',
    'services.title': 'Услуги',
    'services.subtitle': 'Просмотр и заказ SMM услуг',
    'services.categories': 'Категории',
    'services.add_to_cart': 'В корзину',
    'services.order_now': 'Заказать',
    'services.favorites': 'Избранное',
    'cart.title': 'Корзина',
    'cart.empty': 'Корзина пуста',
    'cart.checkout': 'Оформить заказ',
    'cart.total': 'Итого',
    'cart.clear': 'Очистить',
    'profile.title': 'Мой профиль',
    'profile.subtitle': 'Управление настройками',
    'profile.balance': 'Баланс',
    'profile.total_spent': 'Всего потрачено',
    'profile.referrals': 'Рефералы',
    'notifications.title': 'Уведомления',
    'notifications.mark_all_read': 'Прочитать все',
    'notifications.empty': 'Нет уведомлений',
    'notifications.order_update': 'Обновление заказа',
    'notifications.low_balance': 'Низкий баланс',
    'deposit.title': 'Пополнить',
    'deposit.subtitle': 'Пополните баланс',
    'deposit.amount': 'Сумма',
    'deposit.method': 'Способ оплаты',
  },
};

const rtlLanguages: Language[] = ['ar'];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred_language');
    return (saved as Language) || 'en';
  });

  const isRTL = rtlLanguages.includes(language);

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
    
    // Set document direction for RTL languages
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
