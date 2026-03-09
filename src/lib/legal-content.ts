// Compliant legal content templates for buyer storefront
// Uses neutral, professional language suitable for payment processors and ad platforms

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

export const getDefaultTermsOfService = (panelName: string, supportEmail?: string): LegalSection[] => {
  const email = supportEmail || 'support@example.com';
  
  return [
    {
      id: 'introduction',
      title: '1. Introduction & Acceptance',
      content: `Welcome to ${panelName}. By accessing or using our platform, you agree to be bound by these Terms of Service. Our platform provides social media marketing (SMM) services — including likes, followers, views, comments, shares, and other engagement services — designed to help users grow and manage their online presence across major social media platforms.

If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.`
    },
    {
      id: 'service-description',
      title: '2. Service Description',
      content: `${panelName} is a social media marketing (SMM) panel that acts as an intermediary between service providers and end users. We offer a range of SMM services including:

- **Social Media Growth**: Followers, subscribers, and page likes for platforms like Instagram, TikTok, YouTube, Facebook, Twitter/X, Telegram, and more
- **Engagement Services**: Likes, views, comments, shares, saves, and reactions to boost content visibility
- **Content Promotion**: Video views, story views, reel plays, and impression boosts
- **Analytics & Tracking**: Real-time order tracking, delivery status, and performance insights

Service delivery is handled through trusted third-party providers. Results may vary based on platform algorithms and provider capacity.`
    },
    {
      id: 'account-responsibilities',
      title: '3. Account Responsibilities',
      content: `When creating an account, you agree to:

- Provide accurate, current, and complete registration information
- Maintain the security and confidentiality of your login credentials
- Accept responsibility for all activities under your account
- Notify us immediately of any unauthorized account access
- Be at least 18 years of age or the legal age in your jurisdiction

You are solely responsible for ensuring that your use of our services complies with all applicable laws and third-party platform policies.`
    },
    {
      id: 'usage-guidelines',
      title: '4. Service Usage Guidelines',
      content: `We are committed to responsible service delivery. When using our platform, you agree to:

- Use services in accordance with third-party platform terms and policies
- Maintain authentic engagement practices
- Respect balanced pacing and sustainable delivery methods
- Not use services for any unlawful or prohibited purposes
- Not attempt to circumvent any platform limitations or security measures

We reserve the right to refuse service or terminate accounts that violate these guidelines.`
    },
    {
      id: 'payment-terms',
      title: '5. Payment Terms',
      content: `Our platform operates on a prepaid balance system:

- **Deposits**: Funds must be added to your account before placing orders
- **Pricing**: All prices are displayed in your selected currency and include applicable fees
- **Refunds**: Refund requests are handled on a case-by-case basis and may be issued as account credit
- **Balance**: Unused balance remains available in your account until used or refunded upon request
- **Disputes**: Payment disputes should be directed to our support team before initiating chargebacks

All transactions are processed securely through trusted payment providers.`
    },
    {
      id: 'service-delivery',
      title: '6. Service Delivery',
      content: `Service delivery is provided with optimized timing and balanced pacing:

- **Processing**: Orders are processed promptly after confirmation
- **Timeline**: Estimated completion times are provided as guidance only
- **Status Tracking**: Real-time order status is available through your dashboard
- **No Guarantees**: We do not guarantee specific outcomes or results from any service
- **Third-Party Factors**: Delivery may be affected by external platform changes or policies

We strive to provide consistent, quality service while respecting platform guidelines.`
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property',
      content: `All platform content, features, and functionality are owned by ${panelName} and protected by intellectual property laws:

- **Platform Ownership**: The platform design, code, and branding remain our exclusive property
- **User Content**: You retain ownership of content you submit but grant us license to use it for service delivery
- **Restrictions**: You may not copy, modify, or distribute platform materials without authorization

Unauthorized use of our intellectual property may result in account termination and legal action.`
    },
    {
      id: 'limitation-liability',
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by law:

- We are not liable for any indirect, incidental, or consequential damages
- Our total liability is limited to the amount paid for the specific service in question
- We are not responsible for third-party platform policy changes or enforcement actions
- Service availability is provided "as is" without warranties of any kind
- We do not guarantee any specific performance outcomes or results

You acknowledge that external factors beyond our control may affect service delivery.`
    },
    {
      id: 'termination',
      title: '9. Account Termination',
      content: `Accounts may be terminated under the following circumstances:

- **By You**: You may close your account at any time through account settings or by contacting support
- **By Us**: We may suspend or terminate accounts that violate these terms
- **Balance Handling**: Remaining balance may be refunded upon legitimate termination requests
- **Data Retention**: Some data may be retained as required by law or for legitimate business purposes

Upon termination, your access to the platform and services will be immediately revoked.`
    },
    {
      id: 'dispute-resolution',
      title: '10. Dispute Resolution',
      content: `In the event of any dispute:

- **Contact Support First**: Please reach out to our support team before taking further action
- **Good Faith Resolution**: We are committed to resolving disputes fairly and promptly
- **Arbitration**: Unresolved disputes may be subject to binding arbitration
- **Governing Law**: These terms are governed by applicable laws in our jurisdiction

We value our users and aim to resolve any concerns through direct communication.`
    },
    {
      id: 'changes-to-terms',
      title: '11. Changes to Terms',
      content: `We reserve the right to modify these Terms of Service at any time:

- **Notification**: Material changes will be communicated via email or platform notice
- **Review**: We encourage you to review these terms periodically
- **Acceptance**: Continued use of the platform after changes constitutes acceptance
- **Effective Date**: Changes become effective upon posting unless otherwise specified

Your ongoing use of our services indicates your agreement to the current terms.`
    },
    {
      id: 'contact',
      title: '12. Contact Information',
      content: `For questions about these Terms of Service or our services:

- **Email**: ${email}
- **Support Portal**: Access through your account dashboard
- **Response Time**: We aim to respond to all inquiries within 24-48 hours

We are committed to providing clear communication and responsive support.`
    }
  ];
};

export const getDefaultPrivacyPolicy = (panelName: string, supportEmail?: string): LegalSection[] => {
  const email = supportEmail || 'support@example.com';
  
  return [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: `${panelName} is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.

By using our services, you consent to the data practices described in this policy. We encourage you to read this document carefully and contact us with any questions.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: `We collect information necessary to provide and improve our services:

**Account Information:**
- Email address and username
- Password (encrypted and securely stored)
- Profile preferences and settings

**Transaction Data:**
- Order history and service requests
- Payment information (processed by secure third-party providers)
- Account balance and transaction records

**Usage Data:**
- Platform interaction and feature usage (anonymized)
- Device and browser information (for security purposes)
- IP address and general location (for fraud prevention)

We only collect data that is necessary for service delivery and platform improvement.`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      content: `Your information is used for the following purposes:

- **Service Delivery**: Processing orders and managing your account
- **Communication**: Sending order updates, support responses, and important notices
- **Security**: Protecting against fraud, unauthorized access, and abuse
- **Improvement**: Analyzing aggregated, anonymized data to enhance our platform
- **Legal Compliance**: Meeting regulatory and legal obligations

We do not use your personal information for purposes beyond those described here without your consent.`
    },
    {
      id: 'information-sharing',
      title: '4. Information Sharing',
      content: `We limit sharing of your information to essential purposes:

**Service Providers:**
- Payment processors (Stripe, PayPal, etc.) for transaction processing
- Infrastructure providers for platform hosting and security

**Legal Requirements:**
- When required by law, court order, or government request
- To protect our rights, property, or safety

**Important**: We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.`
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      content: `We implement robust security measures to protect your data:

- **Encryption**: Data is encrypted in transit (TLS/SSL) and at rest
- **Access Controls**: Strict access limitations and authentication requirements
- **Monitoring**: Continuous security monitoring and threat detection
- **Regular Reviews**: Periodic security assessments and updates

While we implement industry-standard protections, no system is completely secure. We encourage you to use strong passwords and protect your login credentials.`
    },
    {
      id: 'data-retention',
      title: '6. Data Retention',
      content: `We retain your information based on the following guidelines:

- **Active Accounts**: Data is retained while your account remains active
- **Transaction Records**: Financial records are kept as required by law (typically 7 years)
- **Inactive Accounts**: May be archived or deleted after extended inactivity
- **Deletion Requests**: Processed within 30 days, subject to legal retention requirements

You may request deletion of your personal data at any time, though some information may be retained for legal or security purposes.`
    },
    {
      id: 'your-rights',
      title: '7. Your Rights',
      content: `You have the following rights regarding your personal data:

- **Access**: Request a copy of your personal information
- **Correction**: Update or correct inaccurate data
- **Deletion**: Request removal of your personal data
- **Portability**: Receive your data in a portable format
- **Objection**: Object to certain processing activities
- **Withdraw Consent**: Revoke previously given consent

To exercise these rights, please contact our support team. We will respond to requests within 30 days.`
    },
    {
      id: 'cookies',
      title: '8. Cookies and Tracking',
      content: `Our platform uses cookies and similar technologies:

**Essential Cookies:**
- Required for platform functionality and security
- Cannot be disabled without affecting service

**Analytics (Anonymized):**
- Help us understand platform usage patterns
- Do not identify individual users

**We Do NOT Use:**
- Third-party advertising trackers
- Cross-site tracking for marketing purposes

You can manage cookie preferences through your browser settings.`
    },
    {
      id: 'third-party',
      title: '9. Third-Party Services',
      content: `We integrate with trusted third-party services:

- **Payment Gateways**: Stripe, PayPal, and other payment processors
- **Infrastructure**: Cloud hosting and security providers
- **Analytics**: Anonymized usage analytics tools

Each third-party service has its own privacy policy. We encourage you to review their policies as their data practices may differ from ours.`
    },
    {
      id: 'childrens-privacy',
      title: '10. Children\'s Privacy',
      content: `Our platform is not intended for users under 18 years of age:

- We do not knowingly collect data from minors
- Users must be at least 18 years old or the legal age in their jurisdiction
- If we discover data from a minor, it will be promptly deleted

Parents or guardians who believe their child has provided personal information should contact us immediately.`
    },
    {
      id: 'international',
      title: '11. International Data Transfers',
      content: `Your data may be processed in different locations:

- Data may be transferred to and stored in countries outside your residence
- We implement appropriate safeguards for international transfers
- Standard contractual clauses and security measures are in place

By using our services, you consent to the transfer of your information to jurisdictions that may have different data protection laws.`
    },
    {
      id: 'contact',
      title: '12. Contact & Data Requests',
      content: `For privacy-related inquiries or data requests:

- **Email**: ${email}
- **Response Time**: Within 30 days for data requests
- **Verification**: We may need to verify your identity for data requests

We are committed to transparency and will work with you to address any privacy concerns.`
    },
    {
      id: 'updates',
      title: '13. Policy Updates',
      content: `This Privacy Policy may be updated periodically:

- **Notification**: Material changes will be communicated via email or platform notice
- **Review Date**: Check the "Last Updated" date at the bottom of this page
- **Acceptance**: Continued use after changes constitutes acceptance

We encourage you to review this policy regularly to stay informed about our data practices.`
    }
  ];
};
