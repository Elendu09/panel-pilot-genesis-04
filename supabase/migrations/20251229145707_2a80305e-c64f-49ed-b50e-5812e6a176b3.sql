-- Add privacy policy and terms of service columns to panel_settings
ALTER TABLE public.panel_settings 
ADD COLUMN IF NOT EXISTS privacy_policy text DEFAULT 'We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our services.

**Information We Collect**
- Account information (email, username)
- Transaction history and order details
- Usage data and preferences

**How We Use Your Information**
- To process your orders and transactions
- To provide customer support
- To improve our services
- To send important notifications

**Data Security**
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.

**Your Rights**
You have the right to access, correct, or delete your personal data. Contact us for any privacy-related requests.

**Contact**
For privacy inquiries, please reach out through our support system.',

ADD COLUMN IF NOT EXISTS terms_of_service text DEFAULT 'Welcome to our platform. By using our services, you agree to these terms.

**Service Description**
We provide social media marketing services including followers, likes, views, and engagement services.

**User Responsibilities**
- Provide accurate account information
- Use services in compliance with platform terms
- Not use services for illegal purposes
- Maintain account security

**Orders and Payments**
- All orders are processed as described
- Refunds are provided per our refund policy
- Prices may change without notice

**Service Delivery**
- Delivery times are estimates
- We strive for 100% delivery but cannot guarantee exact quantities
- Partial refunds may be issued for incomplete orders

**Limitation of Liability**
We are not responsible for account suspensions or bans resulting from service use. Use at your own discretion.

**Changes to Terms**
We may update these terms at any time. Continued use constitutes acceptance of new terms.

**Contact**
For questions about these terms, please contact our support team.';