import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReaderView } from './ReaderView'

describe('ReaderView', () => {
  const mockArticle = {
    title: 'Test Article Title',
    content: '<p>This is the article content with <strong>some formatting</strong>.</p>',
    textContent: 'This is the article content with some formatting.',
    length: 100,
    excerpt: 'This is the article content...',
    byline: 'By Test Author',
    dir: 'ltr',
    siteName: 'Test Site',
    lang: 'en'
  }

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('should render the reader view component', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      expect(screen.getByTestId('reader-view')).toBeInTheDocument()
    })

    it('should be hidden when isVisible is false', () => {
      render(<ReaderView article={mockArticle} isVisible={false} />)
      
      const readerView = screen.getByTestId('reader-view')
      expect(readerView).toHaveStyle({ display: 'none' })
    })

    it('should be visible when isVisible is true', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      const readerView = screen.getByTestId('reader-view')
      expect(readerView).not.toHaveStyle({ display: 'none' })
    })
  })

  describe('content rendering', () => {
    it('should render article title', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })

    it('should render article byline when provided', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      expect(screen.getByText('By Test Author')).toBeInTheDocument()
    })

    it('should not render byline when not provided', () => {
      const articleWithoutByline = { ...mockArticle, byline: '' }
      render(<ReaderView article={articleWithoutByline} isVisible={true} />)
      
      expect(screen.queryByText('By Test Author')).not.toBeInTheDocument()
    })

    it('should render article content', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      expect(screen.getByText('some formatting')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply custom styles', () => {
      const customStyles = {
        fontSize: '18px',
        fontFamily: 'Georgia, serif',
        backgroundColor: '#f5f5f5',
        textColor: '#333333'
      }
      
      render(
        <ReaderView 
          article={mockArticle} 
          isVisible={true} 
          customStyles={customStyles}
        />
      )
      
      const readerView = screen.getByTestId('reader-view')
      expect(readerView).toBeInTheDocument()
    })

    it('should use default styles when no custom styles provided', () => {
      render(<ReaderView article={mockArticle} isVisible={true} />)
      
      const readerView = screen.getByTestId('reader-view')
      expect(readerView).toBeInTheDocument()
    })
  })
})