export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const KNOWN_SECTION_TYPES = [
  'HeroSplitImage', 'HeroCenteredOverlay', 'HeroBrokenGrid', 'HeroBento', 'HeroDiagonal', 'HeroDepthStack', 'HeroMarquee', 'HeroStaggerReveal', 'HeroGradientBlobs', 'HeroGradientConic', 'HeroGradientRoute', 'HeroSlideshowKenBurns', 'HeroSlideshowSplit', 'HeroSlideshowPortal', 'HeroKinetic', 'HeroReveal',
  'ProductGridFeatured', 'ProductSingleFocus', 'ProductCardElevate', 'ProductCardZoom', 'ProductCard3DTilt', 'ProductCardFlip', 'ProductCardSlideActions', 'ProductCardMagnetic', 'ProductGridStaggered',
  'CategoryCarousel', 'CategoryCarouselNativeSnap', 'CategoryCarouselDrag', 'CategoryCarouselCenterEmphasis', 'CategoryCarouselAutoplay', 'CategoryCarouselInfinite',
  'TestimonialSlider', 'TestimonialSliderCrossfade', 'TestimonialSliderMultiCard', 'TestimonialSliderVideo',
  'BrandStory', 'BrandStoryZigZag', 'BrandStoryTimeline', 'BrandStoryStickyChapter',
  'NewsletterSignup', 'NewsletterSignupInline', 'NewsletterSignupModal', 'NewsletterSignupProgressive', 'NewsletterSignupSticky',
  'PromoBanner', 'FeatureGrid', 'HeaderStandard', 'FooterDetailed'
];

export function validateStoreConfig(layoutConfig: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!layoutConfig) {
    errors.push({ field: 'root', message: 'Layout config is missing.', severity: 'error' });
    return { valid: false, errors, warnings };
  }

  if (!layoutConfig.theme || !layoutConfig.theme.colors || !layoutConfig.theme.typography) {
    errors.push({ field: 'theme', message: 'Theme object with colors and typography is required.', severity: 'error' });
  }

  if (!layoutConfig.sections || !Array.isArray(layoutConfig.sections)) {
    errors.push({ field: 'sections', message: 'Sections array is required.', severity: 'error' });
  } else {
    if (layoutConfig.sections.length === 0) {
      errors.push({ field: 'sections', message: 'Sections array cannot be empty.', severity: 'error' });
    }

    let hasHero = false;
    let hasProduct = false;
    const seenIds = new Set<string>();

    layoutConfig.sections.forEach((section: any, index: number) => {
      if (!section.id || !section.type || !section.props) {
        errors.push({ field: `sections[${index}]`, message: 'Section must have id, type, and props.', severity: 'error' });
      }

      if (section.id) {
        if (seenIds.has(section.id)) {
          errors.push({ field: `sections[${index}].id`, message: `Duplicate section ID found: ${section.id}`, severity: 'error' });
        }
        seenIds.add(section.id);
      }

      if (section.type) {
        if (!KNOWN_SECTION_TYPES.includes(section.type)) {
          errors.push({ field: `sections[${index}].type`, message: `Unknown section type: ${section.type}`, severity: 'error' });
        }
        if (section.type.startsWith('Hero')) {
          hasHero = true;
          if (!section.props.title && !section.props.headline) {
            errors.push({ field: `sections[${index}].props`, message: 'Hero sections must have a title or headline.', severity: 'error' });
          }
        }
        if (section.type.startsWith('Product')) {
          hasProduct = true;
          if (!section.props.title) {
            errors.push({ field: `sections[${index}].props`, message: 'Product sections must have a title.', severity: 'error' });
          }
        }
      }
    });

    if (!hasHero) {
      errors.push({ field: 'sections', message: 'At least one Hero section is required.', severity: 'error' });
    }
    if (!hasProduct) {
      errors.push({ field: 'sections', message: 'At least one Product section is required.', severity: 'error' });
    }
  }

  if (!layoutConfig.seo_config) {
    warnings.push({ field: 'seo_config', message: 'SEO config is missing.', severity: 'warning' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function validatePatch(patch: any, currentConfig: any): ValidationResult {
  // Simple validation for patches: ensure valid structure if patching entire config
  // More complex JSON patch validation would go here depending on the exact patching spec
  if (!patch) {
    return { valid: false, errors: [{ field: 'patch', message: 'Patch is empty', severity: 'error' }], warnings: [] };
  }
  // In our simplified patch case where patch replaces config, we can just validate the result
  // If patch is partial, we apply it and validate. Let's assume patch represents a partial replacement
  const mergedConfig = { ...currentConfig, ...patch };
  return validateStoreConfig(mergedConfig);
}
