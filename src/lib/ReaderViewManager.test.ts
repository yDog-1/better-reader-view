import { describe, it, expect, beforeEach } from 'vitest'
import { ReaderViewManager } from './ReaderViewManager'

describe('ReaderViewManager', () => {
  let manager: ReaderViewManager
  let mockElement: HTMLElement

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    document.head.innerHTML = '<title>Test Page Title</title>'
    
    // Create a more realistic article structure that Readability can parse
    mockElement = document.createElement('article')
    mockElement.innerHTML = `
      <header>
        <h1>Test Article Title</h1>
        <p class="author">By Test Author</p>
        <time datetime="2023-01-01">January 1, 2023</time>
      </header>
      <div class="content">
        <p>This is the first paragraph of the test article content. It contains enough text to be considered meaningful by Readability.</p>
        <p>This is the second paragraph with more substantial content to ensure the article passes Readability's content length requirements.</p>
        <p>Additional paragraphs help make this a more realistic article structure that will be properly parsed.</p>
      </div>
    `
    document.body.appendChild(mockElement)
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    manager = new ReaderViewManager()
  })

  describe('isActive', () => {
    it('should return false when reader view is not active', () => {
      expect(manager.isActive()).toBe(false)
    })

    it('should return true when reader view is active', () => {
      sessionStorage.setItem('readerViewActive', 'true')
      expect(manager.isActive()).toBe(true)
    })
  })

  describe('toggle', () => {
    it('should activate reader view when currently inactive', async () => {
      const result = await manager.toggle()
      
      expect(result).toBe(true)
      expect(manager.isActive()).toBe(true)
    })

    it('should deactivate reader view when currently active', async () => {
      // First activate
      await manager.toggle()
      
      // Then deactivate
      const result = await manager.toggle()
      
      expect(result).toBe(false)
      expect(manager.isActive()).toBe(false)
    })
  })

  describe('hideOriginalPage', () => {
    it('should hide the original page content', () => {
      manager.hideOriginalPage()
      
      expect(document.body.style.visibility).toBe('hidden')
    })

    it('should store original page HTML', () => {
      const originalHTML = document.documentElement.innerHTML
      
      manager.hideOriginalPage()
      
      expect(sessionStorage.getItem('originalPageHTML')).toBe(originalHTML)
    })
  })

  describe('showOriginalPage', () => {
    it('should restore original page visibility', () => {
      // First hide the page
      manager.hideOriginalPage()
      
      // Then show it
      manager.showOriginalPage()
      
      expect(document.body.style.visibility).toBe('')
    })

    it('should clear stored HTML from sessionStorage', () => {
      manager.hideOriginalPage()
      manager.showOriginalPage()
      
      expect(sessionStorage.getItem('originalPageHTML')).toBeNull()
      expect(sessionStorage.getItem('readerViewActive')).toBeNull()
    })
  })
})