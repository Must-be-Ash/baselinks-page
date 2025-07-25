import SupportButton from "@/components/SupportButton"
import { Twitter, Globe, Linkedin } from "lucide-react"

export default function AshNouruziLinktree() {
  return (
    <div className="linktree-container">
      <div className="profile-section">
        <div className="profile-image">
          <img
            src="https://hiso9xmk1y4nfyzd.public.blob.vercel-storage.com/profile-1753402908822.jpg"
            alt="Ash Nouruzi"
          />
        </div>
        <div className="profile-info">
          <h1>Ash Nouruzi</h1>
          <p className="bio">DevRel at Coinbase Developer Platform</p>
        </div>
      </div>

      <div className="links-section">
        <a href="https://x.com/Must_be_Ash" className="link-button" target="_blank" rel="noopener noreferrer">
          <Twitter className="link-icon" />
          <span className="link-text">Twitter</span>
        </a>

        <a href="https://www.mustbeash.com/" className="link-button" target="_blank" rel="noopener noreferrer">
          <Globe className="link-icon" />
          <span className="link-text">Website</span>
        </a>

        <a
          href="https://www.linkedin.com/in/ash-nouruzi-46a764119/"
          className="link-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="link-icon" />
          <span className="link-text">LinkedIn</span>
        </a>
      </div>

      {/* Ash Nouruzi's Crypto Donation Section */}
      <div className="donation-section">
        <SupportButton />
      </div>

      <footer className="linktree-footer">
        <p>© 2025 Ash Nouruzi</p>
      </footer>
    </div>
  )
}
