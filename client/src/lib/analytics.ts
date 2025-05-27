// Analytics tracking for website generator insights

// Track key user actions and business intelligence
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // For demonstration - this would normally send to analytics service
  console.log('📊 Analytics Event:', {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...properties
  });
  
  // In production, this would also send to your analytics dashboard
  // sendToAnalyticsDashboard(eventName, properties);
};

// Business Intelligence Events
export const trackBusinessType = (businessType: string, location: string) => {
  trackEvent('business_type_selected', {
    business_type: businessType,
    location: location,
    category: 'business_intelligence'
  });
};

export const trackImageUpload = (imageCount: number, uploadType: 'logo' | 'business') => {
  trackEvent('images_uploaded', {
    image_count: imageCount,
    upload_type: uploadType,
    category: 'user_engagement'
  });
};

export const trackVariantSelection = (variantName: string, variantIndex: number) => {
  trackEvent('variant_selected', {
    variant_name: variantName,
    variant_index: variantIndex,
    category: 'product_usage'
  });
};

export const trackCustomDomainInterest = (domainEntered: string) => {
  trackEvent('custom_domain_requested', {
    domain: domainEntered,
    category: 'revenue_opportunity'
  });
};

export const trackConversationComplete = (messageCount: number, timeSpent: number) => {
  trackEvent('conversation_completed', {
    message_count: messageCount,
    time_spent_minutes: Math.round(timeSpent / 60),
    category: 'conversion'
  });
};