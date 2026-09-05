// components/registry.ts
import HeaderStandard from "./sections/HeaderStandard";
import FooterDetailed from "./sections/FooterDetailed";
import HeroSplitImage from "./sections/HeroSplitImage";
import HeroCenteredOverlay from "./sections/HeroCenteredOverlay";
import PromoBanner from "./sections/PromoBanner";
import FeatureGrid from "./sections/FeatureGrid";
import ProductGridFeatured from "./sections/ProductGridFeatured";
import ProductSingleFocus from "./sections/ProductSingleFocus";
import CategoryCarousel from "./sections/CategoryCarousel";
import TestimonialSlider from "./sections/TestimonialSlider";
import BrandStory from "./sections/BrandStory";
import NewsletterSignup from "./sections/NewsletterSignup";

// New dynamic hero variations
import HeroBrokenGrid from "./sections/HeroBrokenGrid";
import HeroBento from "./sections/HeroBento";
import HeroDiagonal from "./sections/HeroDiagonal";
import HeroDepthStack from "./sections/HeroDepthStack";
import HeroMarquee from "./sections/HeroMarquee";
import HeroStaggerReveal from "./sections/HeroStaggerReveal";

// New Product Card & Grid variations
import ProductCardElevate from "./sections/ProductCardElevate";
import ProductCardZoom from "./sections/ProductCardZoom";
import ProductCard3DTilt from "./sections/ProductCard3DTilt";
import ProductCardFlip from "./sections/ProductCardFlip";
import ProductCardSlideActions from "./sections/ProductCardSlideActions";
import ProductCardMagnetic from "./sections/ProductCardMagnetic";
import ProductGridStaggered from "./sections/ProductGridStaggered";
import ProductCardSkeleton from "./sections/ProductCardSkeleton";

// New Product Single Focus variations
import ProductSingleFocusSplitScroll from "./sections/ProductSingleFocusSplitScroll";
import ProductSingleFocusGallery from "./sections/ProductSingleFocusGallery";
import ProductSingleFocusZoom from "./sections/ProductSingleFocusZoom";
import ProductSingleFocus360 from "./sections/ProductSingleFocus360";
import ProductSingleFocusVariantSwap from "./sections/ProductSingleFocusVariantSwap";
import ProductSingleFocusStickyBar from "./sections/ProductSingleFocusStickyBar";

// New Category Carousel variations
import CategoryCarouselNativeSnap from "./sections/CategoryCarouselNativeSnap";
import CategoryCarouselDrag from "./sections/CategoryCarouselDrag";
import CategoryCarouselCenterEmphasis from "./sections/CategoryCarouselCenterEmphasis";
import CategoryCarouselAutoplay from "./sections/CategoryCarouselAutoplay";
import CategoryCarouselInfinite from "./sections/CategoryCarouselInfinite";

export const REGISTRY = {
  HeaderStandard,
  FooterDetailed,
  HeroSplitImage,
  HeroCenteredOverlay,
  PromoBanner,
  FeatureGrid,
  ProductGridFeatured,
  ProductSingleFocus,
  CategoryCarousel,
  TestimonialSlider,
  BrandStory,
  NewsletterSignup,
  HeroBrokenGrid,
  HeroBento,
  HeroDiagonal,
  HeroDepthStack,
  HeroMarquee,
  HeroStaggerReveal,
  ProductCardElevate,
  ProductCardZoom,
  ProductCard3DTilt,
  ProductCardFlip,
  ProductCardSlideActions,
  ProductCardMagnetic,
  ProductGridStaggered,
  ProductCardSkeleton,
  ProductSingleFocusSplitScroll,
  ProductSingleFocusGallery,
  ProductSingleFocusZoom,
  ProductSingleFocus360,
  ProductSingleFocusVariantSwap,
  ProductSingleFocusStickyBar,
  CategoryCarouselNativeSnap,
  CategoryCarouselDrag,
  CategoryCarouselCenterEmphasis,
  CategoryCarouselAutoplay,
  CategoryCarouselInfinite,
  TestimonialSliderCrossfade,
  TestimonialSliderMultiCard,
  TestimonialSliderVideo,
  NewsletterSignupInline,
  NewsletterSignupModal,
  NewsletterSignupProgressive,
  NewsletterSignupSticky,
  BrandStoryZigZag,
  BrandStoryTimeline,
  BrandStoryStickyChapter,
  HeroGradientBlobs,
  HeroGradientConic,
  HeroGradientRoute,
  HeroSlideshowKenBurns,
  HeroSlideshowSplit,
  HeroSlideshowPortal,
  HeroKinetic,
  HeroReveal,
};

// New Testimonial Slider variations
import TestimonialSliderCrossfade from "./sections/TestimonialSliderCrossfade";
import TestimonialSliderMultiCard from "./sections/TestimonialSliderMultiCard";
import TestimonialSliderVideo from "./sections/TestimonialSliderVideo";

// New Newsletter Signup variations
import NewsletterSignupInline from "./sections/NewsletterSignupInline";
import NewsletterSignupModal from "./sections/NewsletterSignupModal";
import NewsletterSignupProgressive from "./sections/NewsletterSignupProgressive";
import NewsletterSignupSticky from "./sections/NewsletterSignupSticky";

// New Brand Story variations
import BrandStoryZigZag from "./sections/BrandStoryZigZag";
import BrandStoryTimeline from "./sections/BrandStoryTimeline";
import BrandStoryStickyChapter from "./sections/BrandStoryStickyChapter";

// New Hero Gradient variations
import HeroGradientBlobs from "./sections/HeroGradientBlobs";
import HeroGradientConic from "./sections/HeroGradientConic";
import HeroGradientRoute from "./sections/HeroGradientRoute";

// New Hero Slideshow variations
import HeroSlideshowKenBurns from "./sections/HeroSlideshowKenBurns";
import HeroSlideshowSplit from "./sections/HeroSlideshowSplit";
import HeroSlideshowPortal from "./sections/HeroSlideshowPortal";

// New Kinetic typography hero variations
import HeroKinetic from "./sections/HeroKinetic";

// New Timed reveal hero variations
import HeroReveal from "./sections/HeroReveal";

export type SectionType = keyof typeof REGISTRY;
