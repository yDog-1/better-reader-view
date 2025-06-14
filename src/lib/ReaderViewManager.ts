import { Readability } from '@mozilla/readability'

interface Article {
  title: string
  content: string
  textContent: string
  length: number
  excerpt: string
  byline: string | null
  dir: string | null
  siteName: string | null
  lang: string | null
}

export class ReaderViewManager {
  private readonly READER_VIEW_ACTIVE_KEY = 'readerViewActive'
  private readonly ORIGINAL_PAGE_HTML_KEY = 'originalPageHTML'
  private readonly ORIGINAL_PAGE_TITLE_KEY = 'originalPageTitle'

  isActive(): boolean {
    return sessionStorage.getItem(this.READER_VIEW_ACTIVE_KEY) === 'true'
  }

  async toggle(): Promise<boolean> {
    if (this.isActive()) {
      this.showOriginalPage()
      return false
    } else {
      const success = await this.activateReaderView()
      return success
    }
  }

  hideOriginalPage(): void {
    // Store original page HTML and title
    const originalHTML = document.documentElement.innerHTML
    const originalTitle = document.title
    
    sessionStorage.setItem(this.ORIGINAL_PAGE_HTML_KEY, originalHTML)
    sessionStorage.setItem(this.ORIGINAL_PAGE_TITLE_KEY, originalTitle)
    
    // Hide original page
    document.body.style.visibility = 'hidden'
  }

  showOriginalPage(): void {
    // Restore original page visibility
    document.body.style.visibility = ''
    
    // Clear stored data
    sessionStorage.removeItem(this.READER_VIEW_ACTIVE_KEY)
    sessionStorage.removeItem(this.ORIGINAL_PAGE_HTML_KEY)
    sessionStorage.removeItem(this.ORIGINAL_PAGE_TITLE_KEY)
  }

  private async activateReaderView(): Promise<boolean> {
    try {
      // Use Readability to parse the page
      const documentClone = document.cloneNode(true) as Document
      const article = new Readability(documentClone).parse()
      
      if (!this.isValidArticle(article)) {
        return false
      }

      // Hide original page
      this.hideOriginalPage()
      
      // Mark as active
      sessionStorage.setItem(this.READER_VIEW_ACTIVE_KEY, 'true')
      
      return true
    } catch (error) {
      console.error('Failed to activate reader view:', error)
      return false
    }
  }

  private isArticle(article: unknown): article is Article {
    return (
      typeof article === 'object' &&
      article !== null &&
      typeof (article as Article).title === 'string' &&
      typeof (article as Article).content === 'string' &&
      typeof (article as Article).textContent === 'string' &&
      typeof (article as Article).length === 'number'
    )
  }

  private isValidArticle(article: unknown): boolean {
    if (!this.isArticle(article)) {
      return false
    }
    return (
      article.title.trim() !== '' &&
      article.content.trim() !== ''
    )
  }
}