import SupportButton from "@/components/SupportButton"
import { Twitter, Globe, Linkedin } from "lucide-react"
import { TextShimmer } from "@/components/ui/text-shimmer"

export default function AshNouruziLinktree() {
  // Environment variables for personal information
  const PROFILE_NAME = process.env.NEXT_PUBLIC_PROFILE_NAME!
  const PROFILE_IMAGE = process.env.NEXT_PUBLIC_PROFILE_IMAGE!
  const PROFILE_BIO = process.env.NEXT_PUBLIC_PROFILE_BIO!
  const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL!
  const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL!
  const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL!
  const DONATION_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS!

  return (
    <div className="linktree-container">
      <div className="profile-section">
        <div className="profile-image">
          <img
            src={PROFILE_IMAGE}
            alt={PROFILE_NAME}
          />
        </div>
        <div className="profile-info">
          <h1>{PROFILE_NAME}</h1>
          <p className="bio">{PROFILE_BIO}</p>
        </div>
      </div>

      <div className="links-section">
        <a href={TWITTER_URL} className="link-button" target="_blank" rel="noopener noreferrer">
          <Twitter className="link-icon" />
          <span className="link-text">Twitter</span>
        </a>

        <a href={WEBSITE_URL} className="link-button" target="_blank" rel="noopener noreferrer">
          <Globe className="link-icon" />
          <span className="link-text">Website</span>
        </a>

        <a
          href={LINKEDIN_URL}
          className="link-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="link-icon" />
          <span className="link-text">LinkedIn</span>
        </a>
      </div>

      {/* Crypto Donation Section */}
      <div className="donation-section">
        <SupportButton />
      </div>

      {/* Get Your Own Baselinks CTA */}
      <div className="baselinks-cta">
        <a 
          href="https://baselinks.xyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="baselinks-link"
        >
          <TextShimmer 
            as="span" 
            duration={2.5} 
            spread={1.5}
            className="text-lg font-bold"
          >
            Get your own BaseLink
          </TextShimmer>
        </a>
        <p className="powered-by">Powered by Coinbase Developer Platform</p>
      </div>

      <footer className="linktree-footer">
        <p>© 2025 baselinks.xyz</p>
      </footer>
    </div>
  )
}
