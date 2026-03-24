import { BannerAd as GoogleBannerAd, BannerAdSize as GoogleBannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Gerçek reklam ID'leri
const BANNER_AD_UNIT_ID = 'ca-app-pub-4413683938790117/2677188979';

// Test modunda mı kontrol et
const __DEV__ = process.env.NODE_ENV === 'development';

// Production'da gerçek ID, Development'da test ID kullan
const getBannerAdUnitId = (): string => {
    return __DEV__ ? TestIds.BANNER : BANNER_AD_UNIT_ID;
};

export { GoogleBannerAd as BannerAd, GoogleBannerAdSize as BannerAdSize, getBannerAdUnitId };
