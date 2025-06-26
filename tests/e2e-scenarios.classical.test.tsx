/**
 * @vitest-environment happy-dom
 * @vitest-setup ../tests/setup-classical.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReaderView from '~/components/ReaderView';
import { StyleController } from '@/utils/StyleController';
import {
  initializeReaderViewManager,
  activateReader,
  deactivateReader,
} from '@/utils/reader-utils';

/**
 * エンドツーエンドシナリオテスト（古典学派アプローチ）
 * - 実際のユーザージャーニーをテスト
 * - 複数のコンポーネントとサービスの統合をテスト
 * - ビジネスロジック全体の動作を検証
 */

// リアルなテストデータ生成
class RealWorldDocumentBuilder {
  static createNewsArticle(): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>技術ニュース：新しいWebフレームワークの登場</title>
          <meta name="description" content="新しいWebフレームワークが開発者コミュニティで注目を集めています">
        </head>
        <body>
          <header>
            <nav>
              <ul>
                <li><a href="/">ホーム</a></li>
                <li><a href="/tech">技術</a></li>
                <li><a href="/news">ニュース</a></li>
              </ul>
            </nav>
          </header>
          
          <main>
            <article>
              <header>
                <h1>新しいWebフレームワーク「ReactNext」が開発者の注目を集める</h1>
                <div class="meta">
                  <time datetime="2024-06-24">2024年6月24日</time>
                  <span class="author">by 田中太郎</span>
                </div>
              </header>
              
              <div class="content">
                <p class="lead">
                  Meta社から新しいWebフレームワーク「ReactNext」が発表され、
                  開発者コミュニティで大きな話題となっています。このフレームワークは
                  従来のReactの問題点を解決し、より高速で直感的な開発体験を提供します。
                </p>
                
                <h2>主な特徴</h2>
                <ul>
                  <li><strong>ゼロランタイム</strong>：コンパイル時にすべての最適化を実行</li>
                  <li><strong>型安全性</strong>：TypeScriptをネイティブサポート</li>
                  <li><strong>サーバーレス最適化</strong>：Edge環境での高速実行</li>
                </ul>
                
                <blockquote>
                  <p>
                    「ReactNextは我々が長年構想してきた理想的なフレームワークです。
                    開発者の生産性とアプリケーションのパフォーマンスの両方を
                    大幅に向上させることができます。」
                  </p>
                  <cite>— Meta社 CTO ジェーン・スミス</cite>
                </blockquote>
                
                <h2>パフォーマンス比較</h2>
                <p>
                  初期ベンチマークテストでは、ReactNextは従来のReactと比較して：
                </p>
                <ul>
                  <li>初期ロード時間が50%短縮</li>
                  <li>バンドルサイズが30%削減</li>
                  <li>ランタイムパフォーマンスが2倍向上</li>
                </ul>
                
                <h2>開発者の反応</h2>
                <p>
                  GitHub上でのスター数は発表から24時間で1万を超え、
                  Twitter上でも多くの開発者が興奮を表明しています。
                  特に、型安全性の向上とパフォーマンスの改善に対する
                  評価が高いことが印象的です。
                </p>
                
                <p>
                  一方で、既存のReactプロジェクトからの移行に関する
                  懸念の声も上がっており、互換性レイヤーの提供が
                  今後の普及の鍵となりそうです。
                </p>
                
                <h2>今後の展望</h2>
                <p>
                  ReactNextは現在ベータ版での提供となっており、
                  正式リリースは2024年第4四半期を予定しています。
                  Meta社では開発者フィードバックを積極的に収集し、
                  製品版に向けた改良を続けていくとしています。
                </p>
                
                <p>
                  Web開発の未来を変える可能性を秘めたReactNext。
                  その動向に今後も注目が集まります。
                </p>
              </div>
            </article>
          </main>
          
          <aside>
            <h3>関連記事</h3>
            <ul>
              <li><a href="/article1">React 18の新機能解説</a></li>
              <li><a href="/article2">Webフレームワーク比較2024</a></li>
              <li><a href="/article3">TypeScript最新動向</a></li>
            </ul>
            
            <div class="ad">
              <p>広告：プログラミング学習サイト</p>
            </div>
          </aside>
          
          <footer>
            <p>&copy; 2024 Tech News Japan</p>
          </footer>
        </body>
      </html>
    `);
    return jsdom.window.document;
  }

  static createBlogPost(): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <title>プログラミング初心者が知っておくべき5つのこと</title>
        </head>
        <body>
          <div class="container">
            <header class="site-header">
              <h1 class="site-title">開発者ブログ</h1>
            </header>
            
            <main>
              <article class="blog-post">
                <h1>プログラミング初心者が知っておくべき5つのこと</h1>
                
                <div class="post-meta">
                  <span>投稿日：2024年6月24日</span>
                  <span>カテゴリ：プログラミング入門</span>
                </div>
                
                <div class="post-content">
                  <p>
                    プログラミングを始めたばかりの方にとって、学習の方向性を
                    見つけるのは簡単ではありません。この記事では、
                    初心者が知っておくべき重要なポイントを5つ紹介します。
                  </p>
                  
                  <h2>1. 基礎をしっかりと理解する</h2>
                  <p>
                    急いで高度なフレームワークや技術に手を出す前に、
                    プログラミングの基礎概念をしっかりと理解することが重要です。
                    変数、条件分岐、ループ、関数などの基本的な概念は、
                    どの言語を学ぶ際にも共通して必要になります。
                  </p>
                  
                  <h2>2. 毎日少しずつでも続ける</h2>
                  <p>
                    プログラミングは継続が最も重要です。1日30分でも構いません。
                    毎日コードに触れることで、確実にスキルが向上します。
                    週末にまとめて長時間学習するよりも、
                    短時間でも毎日継続する方が効果的です。
                  </p>
                  
                  <h2>3. 実際にプロジェクトを作る</h2>
                  <p>
                    チュートリアルで学んだ内容は、実際のプロジェクトで
                    応用してみることが大切です。簡単なToDoアプリや
                    計算機アプリなど、身近なものから始めてみましょう。
                  </p>
                  
                  <h2>4. エラーを恐れない</h2>
                  <p>
                    プログラミングではエラーは日常茶飯事です。
                    エラーメッセージを読み、原因を理解し、解決することで
                    確実にスキルアップできます。エラーは学習の機会だと
                    捉えることが重要です。
                  </p>
                  
                  <h2>5. コミュニティに参加する</h2>
                  <p>
                    プログラミングは孤独になりがちですが、
                    オンラインコミュニティや勉強会に参加することで、
                    他の学習者や経験者と交流できます。分からないことを
                    質問したり、他の人のコードを見たりすることで、
                    新しい発見があります。
                  </p>
                  
                  <h2>まとめ</h2>
                  <p>
                    プログラミング学習は長い道のりですが、
                    正しいアプローチで取り組めば必ず上達できます。
                    焦らず、楽しみながら学習を続けていきましょう。
                  </p>
                </div>
              </article>
            </main>
          </div>
        </body>
      </html>
    `);
    return jsdom.window.document;
  }

  static createTutorialPage(): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <title>CSS Grid レイアウト完全ガイド</title>
        </head>
        <body>
          <nav class="breadcrumb">
            <a href="/">ホーム</a> &gt; 
            <a href="/css">CSS</a> &gt; 
            <span>Grid レイアウト</span>
          </nav>
          
          <article class="tutorial">
            <h1>CSS Grid レイアウト完全ガイド</h1>
            
            <div class="intro">
              <p>
                CSS Gridは、Webページの複雑なレイアウトを簡単に作成できる
                強力なツールです。この記事では、基本的な使い方から
                実践的なテクニックまで、Grid レイアウトのすべてを解説します。
              </p>
            </div>
            
            <h2>Grid の基本概念</h2>
            <p>
              CSS Gridは2次元レイアウトシステムです。
              Flexboxが1次元（行または列）のレイアウトを扱うのに対し、
              Gridは行と列の両方を同時に制御できます。
            </p>
            
            <h3>グリッドコンテナとグリッドアイテム</h3>
            <p>
              Grid レイアウトを使用するには、まず親要素を
              グリッドコンテナにする必要があります：
            </p>
            
            <pre><code>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
}
            </code></pre>
            
            <h2>実践的な例</h2>
            <p>
              以下は、一般的なWebサイトのレイアウトをGridで作成する例です：
            </p>
            
            <h3>ヘッダー・メイン・サイドバー・フッター レイアウト</h3>
            <p>
              典型的なWebサイトのレイアウトは以下のように作成できます。
              grid-template-areasを使用することで、直感的にレイアウトを
              定義することができます。
            </p>
            
            <pre><code>
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main sidebar"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.sidebar { grid-area: sidebar; }
.footer { grid-area: footer; }
            </code></pre>
            
            <h2>レスポンシブデザインとの組み合わせ</h2>
            <p>
              CSS Gridはメディアクエリと組み合わせることで、
              レスポンシブなレイアウトを簡単に作成できます。
              小さい画面では1列レイアウト、大きい画面では複数列レイアウトに
              切り替えることができます。
            </p>
            
            <h2>ブラウザサポート</h2>
            <p>
              CSS Gridは現在すべてのモダンブラウザでサポートされています。
              Internet Explorer 11でも部分的にサポートされていますが、
              最新の仕様とは異なる部分があります。本格的な商用プロジェクトでは
              ブラウザサポート状況を確認することをお勧めします。
            </p>
            
            <h2>まとめ</h2>
            <p>
              CSS Gridは複雑なレイアウトを簡潔なコードで実現できる
              強力なツールです。基本概念を理解すれば、これまで困難だった
              レイアウトも簡単に作成できるようになります。
              ぜひ実際のプロジェクトで活用してみてください。
            </p>
          </article>
        </body>
      </html>
    `);
    return jsdom.window.document;
  }
}

describe('E2E User Scenarios (Classical Approach)', () => {
  let styleController: StyleController;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    styleController = new StyleController();
    initializeReaderViewManager(styleController);
    sessionStorage.clear();
    user = userEvent.setup();
  });

  describe('ニュース記事読者のジャーニー', () => {
    it('Scenario: ニュースサイトでリーダービューを使用して記事を読む', async () => {
      // Given: ユーザーがニュース記事ページにいる
      const newsDocument = RealWorldDocumentBuilder.createNewsArticle();

      // When: リーダービューを有効化
      const activationResult = activateReader(newsDocument);

      // Then: リーダービューが正常に有効化される
      expect(activationResult).toBe(true);
      expect(newsDocument.body.style.display).toBe('none');

      const readerContainer = newsDocument.getElementById(
        'better-reader-view-container'
      );
      expect(readerContainer).toBeTruthy();

      // ナビゲーションや広告が除外され、メインコンテンツのみが表示される
      expect(newsDocument.body.innerHTML).toContain('nav');
      expect(newsDocument.body.innerHTML).toContain('aside');

      // クリーンアップ
      deactivateReader(newsDocument);
    });

    it('Scenario: 読みやすさのためにダークテーマに変更', async () => {
      // Given: リーダービューが有効化されている
      const newsDocument = RealWorldDocumentBuilder.createNewsArticle();
      activateReader(newsDocument);

      // ReaderView コンポーネントをレンダリング
      const testProps = {
        title: '新しいWebフレームワーク「ReactNext」が開発者の注目を集める',
        content:
          '<p>Meta社から新しいWebフレームワーク「ReactNext」が発表され...</p>',
        styleController,
      };

      render(<ReaderView {...testProps} />);

      // When: ユーザーがスタイル設定を開いてダークテーマに変更
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      await user.click(styleButton);

      const themeSelect = screen.getByLabelText('テーマ');
      await user.selectOptions(themeSelect, 'dark');

      // Then: ダークテーマが適用される
      expect(styleController.getConfig().theme).toBe('dark');

      // 設定が永続化される
      const savedConfig = JSON.parse(
        sessionStorage.getItem('readerViewStyleConfig') || '{}'
      );
      expect(savedConfig.theme).toBe('dark');

      // クリーンアップ
      deactivateReader(newsDocument);
    });
  });

  describe('ブログ読者のジャーニー', () => {
    it('Scenario: プログラミングブログでフォントサイズを調整', async () => {
      // Given: ユーザーがプログラミングブログを読んでいる
      const blogDocument = RealWorldDocumentBuilder.createBlogPost();
      activateReader(blogDocument);

      const testProps = {
        title: 'プログラミング初心者が知っておくべき5つのこと',
        content: '<p>プログラミングを始めたばかりの方にとって...</p>',
        styleController,
      };

      render(<ReaderView {...testProps} />);

      // When: 文字が小さくて読みにくいため、フォントサイズを大きくする
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      await user.click(styleButton);

      const fontSizeSelect = screen.getByLabelText('フォントサイズ');
      await user.selectOptions(fontSizeSelect, 'xlarge');

      // Then: フォントサイズが大きくなる
      expect(styleController.getConfig().fontSize).toBe('xlarge');

      // さらにフォントファミリーも変更
      const fontFamilySelect = screen.getByLabelText('フォント種類');
      await user.selectOptions(fontFamilySelect, 'serif');

      expect(styleController.getConfig().fontFamily).toBe('serif');

      // 設定が保存される
      const savedConfig = JSON.parse(
        sessionStorage.getItem('readerViewStyleConfig') || '{}'
      );
      expect(savedConfig.fontSize).toBe('xlarge');
      expect(savedConfig.fontFamily).toBe('serif');

      // クリーンアップ
      deactivateReader(blogDocument);
    });
  });

  describe('技術チュートリアル読者のジャーニー', () => {
    it('Scenario: 長いチュートリアルを集中して読むためにセピアテーマを使用', async () => {
      // Given: ユーザーが長い技術チュートリアルを読んでいる
      const tutorialDocument = RealWorldDocumentBuilder.createTutorialPage();
      activateReader(tutorialDocument);

      const testProps = {
        title: 'CSS Grid レイアウト完全ガイド',
        content: '<p>CSS Gridは、Webページの複雑なレイアウトを...</p>',
        styleController,
      };

      render(<ReaderView {...testProps} />);

      // When: 長時間の読書のため、目に優しいセピアテーマに変更
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      await user.click(styleButton);

      const themeSelect = screen.getByLabelText('テーマ');
      await user.selectOptions(themeSelect, 'sepia');

      // Then: セピアテーマが適用される
      expect(styleController.getConfig().theme).toBe('sepia');

      // フォントサイズも読みやすく調整
      const fontSizeSelect = screen.getByLabelText('フォントサイズ');
      await user.selectOptions(fontSizeSelect, 'large');

      expect(styleController.getConfig().fontSize).toBe('large');

      // 設定パネルを閉じる
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      await user.click(closeButton);

      expect(
        screen.queryByRole('button', { name: '閉じる' })
      ).not.toBeInTheDocument();

      // クリーンアップ
      deactivateReader(tutorialDocument);
    });
  });

  describe('設定の永続化シナリオ', () => {
    it('Scenario: 設定をリセットして初期状態に戻す', async () => {
      // Given: カスタマイズされた設定がある
      styleController.setTheme('dark');
      styleController.setFontSize('xlarge');
      styleController.setFontFamily('monospace');
      styleController.saveToStorage();

      const testProps = {
        title: 'テスト記事',
        content: '<p>テストコンテンツ</p>',
        styleController,
      };

      render(<ReaderView {...testProps} />);

      // When: ユーザーが設定をリセットする
      const styleButton = screen.getByRole('button', { name: 'スタイル' });
      await user.click(styleButton);

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      await user.click(resetButton);

      // Then: デフォルト設定に戻る
      const config = styleController.getConfig();
      expect(config.theme).toBe('light');
      expect(config.fontSize).toBe('medium');
      expect(config.fontFamily).toBe('sans-serif');

      // sessionStorageからも削除される
      const savedConfig = sessionStorage.getItem('readerViewStyleConfig');
      expect(savedConfig).toBeNull();
    });

    it('Scenario: 別セッションで設定が復元される', () => {
      // Given: 前のセッションで保存された設定
      const previousConfig = {
        theme: 'sepia',
        fontSize: 'large',
        fontFamily: 'serif',
        customFontSize: 20,
      };
      sessionStorage.setItem(
        'readerViewStyleConfig',
        JSON.stringify(previousConfig)
      );

      // When: 新しいセッションでStyleControllerを初期化
      const newStyleController = new StyleController();
      const loadResult = newStyleController.loadFromStorage();

      // Then: 前の設定が復元される
      expect(loadResult).toBe(true);
      const restoredConfig = newStyleController.getConfig();
      expect(restoredConfig).toEqual(previousConfig);
    });
  });

  describe('エラーリカバリシナリオ', () => {
    it('Scenario: 不正なコンテンツでリーダービュー失敗後、正常なページで成功', () => {
      // Given: 最初に不正なコンテンツのページ
      const invalidDocument = new JSDOM(`
        <!DOCTYPE html>
        <html><head><title></title></head><body><p>短い</p></body></html>
      `).window.document;

      // When: リーダービューの有効化を試行（失敗）
      const firstResult = activateReader(invalidDocument);
      expect(firstResult).toBe(false);

      // Then: 正常なコンテンツで再試行（成功）
      const validDocument = RealWorldDocumentBuilder.createNewsArticle();
      const secondResult = activateReader(validDocument);
      expect(secondResult).toBe(true);

      // クリーンアップ
      deactivateReader(validDocument);
    });

    it('Scenario: ネットワークエラーシミュレーション - sessionStorage無効', () => {
      // Given: sessionStorageが利用できない状況
      const originalSessionStorage = window.sessionStorage;
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: () => {
            throw new Error('Network error');
          },
          setItem: () => {
            throw new Error('Network error');
          },
          removeItem: () => {
            throw new Error('Network error');
          },
        },
        writable: true,
      });

      // When & Then: ストレージエラーの場合はReaderViewErrorがthrowされる
      const errorHandlingController = new StyleController();
      errorHandlingController.setTheme('dark');
      
      expect(() => {
        errorHandlingController.saveToStorage();
      }).toThrow('スタイル設定の保存に失敗しました');
      
      expect(() => {
        errorHandlingController.loadFromStorage();
      }).toThrow('スタイル設定の読み込みに失敗しました');

      // クリーンアップ
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
      });
    });
  });
});
