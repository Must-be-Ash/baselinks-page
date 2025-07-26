# BaseLinks

Create your own crypto donation page in 4 simple steps with BaseLinks. This tool helps you generate personalized `.env` files for your crypto donation links page using the Coinbase Developer Platform (CDP).

## 🚀 Quick Start

Follow these 4 simple steps to set up your crypto donation page:

### Step 1: Clone the Repository

```bash
git clone https://github.com/Must-be-Ash/baselinks-page
cd baselinks-page
```

### Step 2: Get Your CDP API Keys

1. Visit the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project or use an existing one
3. Navigate to **API Keys** → **Secret API Keys**
4. Create a new Secret API Key
5. Note down your:
   - **Project ID**
   - **API Key Name**
   - **Private Key**

### Step 3: Create Your `.env` File

Create a `.env` file in the root directory with the following template:

```env
# CDP API Configuration
# Get these from https://portal.cdp.coinbase.com/projects/api-keys

# Your CDP Project ID
CDP_PROJECT_ID=your-project-id-here

# CDP Secret API Key (required for session token generation)
# Create a Secret API Key in CDP Portal -> API Keys -> Secret API Keys
CDP_API_KEY_NAME=your-api-key-name-here
CDP_PRIVATE_KEY=your-private-key-here

# Example private key format (replace with your actual key):
# CDP_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEI...\n-----END EC PRIVATE KEY-----

# Site Configuration
NEXT_PUBLIC_SITE_NAME=Your Name
NEXT_PUBLIC_SITE_URL=https://your-site-url.com
NEXT_PUBLIC_SITE_TITLE=Your Name - Links & Support
NEXT_PUBLIC_SITE_DESCRIPTION=Your description here. Tell visitors about yourself and what you do.
NEXT_PUBLIC_SITE_KEYWORDS=your,keywords,here,comma,separated
NEXT_PUBLIC_OG_IMAGE=/og.png

# Personal Information
NEXT_PUBLIC_PROFILE_NAME="Your Full Name"
NEXT_PUBLIC_PROFILE_IMAGE="https://your-image-url.com/profile.jpg"
NEXT_PUBLIC_PROFILE_BIO="Your professional title or bio"
NEXT_PUBLIC_DONATION_ADDRESS="0xYourWalletAddressHere"

# Social Links
NEXT_PUBLIC_TWITTER_URL="https://x.com/yourusername"
NEXT_PUBLIC_WEBSITE_URL="https://your-website.com/"
NEXT_PUBLIC_LINKEDIN_URL="https://www.linkedin.com/in/yourprofile/"
```

### Step 4: Configure CORS Settings

1. Go to [CDP CORS Configuration](https://portal.cdp.coinbase.com/products/embedded-wallets/cors)
2. Add your BaseLinks URL to the allowed origins
3. This enables the crypto donation functionality to work properly

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables Explained

### CDP Configuration
- `CDP_PROJECT_ID`: Your Coinbase Developer Platform project ID
- `CDP_API_KEY_NAME`: The name of your CDP API key
- `CDP_PRIVATE_KEY`: Your CDP private key for authentication

### Site Configuration
- `NEXT_PUBLIC_SITE_NAME`: Your name or brand name
- `NEXT_PUBLIC_SITE_URL`: Your deployed site URL
- `NEXT_PUBLIC_SITE_TITLE`: Page title for SEO
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Meta description for SEO
- `NEXT_PUBLIC_SITE_KEYWORDS`: SEO keywords (comma-separated)
- `NEXT_PUBLIC_OG_IMAGE`: Open Graph image path

### Personal Information
- `NEXT_PUBLIC_PROFILE_NAME`: Your full name
- `NEXT_PUBLIC_PROFILE_IMAGE`: URL to your profile picture
- `NEXT_PUBLIC_PROFILE_BIO`: Your professional title or short bio
- `NEXT_PUBLIC_DONATION_ADDRESS`: Your crypto wallet address for donations

### Social Links
- `NEXT_PUBLIC_TWITTER_URL`: Your Twitter/X profile URL
- `NEXT_PUBLIC_WEBSITE_URL`: Your personal website URL
- `NEXT_PUBLIC_LINKEDIN_URL`: Your LinkedIn profile URL

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Customization

### Styling
- Modify `app/globals.css` for custom styles
- Update `tailwind.config.js` for theme customization
- Replace images in the `public/` directory

### Features
- Add more social links in the `.env` file
- Customize the donation flow
- Modify the UI components in `app/components/`

## 📚 Resources

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [CDP Documentation](https://docs.cdp.coinbase.com/)
2. Verify your CORS settings are correct
3. Ensure all environment variables are properly set
4. Open an issue on GitHub

---

**Powered by [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)**
