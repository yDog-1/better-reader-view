# Better Reader View - テスト構造ドキュメント

このドキュメントでは、Better Reader Viewプロジェクトのテストコード構造について説明します。本プロジェクトは**古典派のテスト手法**を採用し、モックを最小限に抑えて実際のデータと動作を重視したテスト戦略を実装しています。

## テストスイートの全体構造

本プロジェクトは以下の2つの主要なテスト環境を採用しています：

### 1. ユニット・統合テスト（Vitest）

- **実行環境**: happy-dom
- **設定ファイル**: `vitest.config.ts`
- **セットアップ**: `tests/setup.ts`
- **対象**: コンポーネント、ユーティリティ関数、ビジネスロジック
- **プラグイン**: WxtVitest、vanillaExtractPlugin

### 2. E2Eテスト（Playwright）

- **実行環境**: 実際のブラウザ（Chrome、Firefox）
- **設定ファイル**: `playwright.config.ts`
- **セットアップ**: `tests/e2e/global-setup.ts`
- **対象**: 実際のブラウザでの統合動作

## ディレクトリ構成

```
tests/
├── setup.ts                           # ユニットテスト共通セットアップ
├── reader-utils.test.ts               # 純粋関数のテスト
├── StyleController.test.ts            # スタイル管理クラスのテスト
├── ReaderView.test.tsx                # Reactコンポーネントのテスト
├── StylePanel.test.tsx                # UIコンポーネントのテスト
├── error-scenarios.test.tsx           # エラーハンドリングのテスト
└── e2e/                               # E2Eテスト関連
    ├── global-setup.ts                # Playwright全体セットアップ
    ├── fixtures.ts                    # Chrome/Firefox fixture定義
    ├── firefox-fixtures.ts            # Firefox専用fixture
    ├── utils-bridge.js                # Firefox用ユーティリティブリッジ
    ├── test-page.html                 # テスト用HTMLページ
    ├── wxt-integration.spec.ts        # Chrome拡張機能統合テスト
    ├── firefox-integration.spec.ts   # Firefox機能テスト
    └── firefox-contract.spec.ts      # Firefox契約ベーステスト
```

## Vitestプラグイン構成

### WxtVitest プラグイン

```typescript
import { WxtVitest } from 'wxt/testing';
```

- **目的**: WXT拡張機能フレームワーク特有のテスト環境セットアップ
- **提供機能**:
  - `fakeBrowser`: ブラウザAPIのモック機能
  - WXT auto-importとの統合
  - 拡張機能特有のグローバル設定

#### fakeBrowserユーティリティ

WXTが提供するテスト用ブラウザAPIモック：

```typescript
import { fakeBrowser } from 'wxt/testing';

beforeEach(() => {
  fakeBrowser.reset(); // 各テスト前に状態リセット
});
```

**主な機能**:

- `sessionStorage`/`localStorage`のモック
- ブラウザ拡張機能APIの基本的なモック
- テスト間での状態分離

### vanillaExtractPlugin

```typescript
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
```

- **目的**: Vanilla Extract CSS-in-JSのViteテスト環境統合
- **課題**: WXT + Vitest環境でのfileScope制約
- **実装戦略**:
  - プラグイン使用によるビルド時CSS処理
  - テスト環境での型安全なCSS変数アクセス
  - モックとの併用による安定したテスト実行

#### Vanilla Extract統合の課題と対応

**技術的制約**:

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [
    WxtVitest(),
    vanillaExtractPlugin(), // CSS-in-JS処理
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
  },
});
```

**対応戦略**:

1. **プラグインレベル**: vanillaExtractPluginで基本構造維持
2. **テストレベル**: setup.tsでの戦略的モック
3. **検証レベル**: E2E視覚的回帰テストでの実際検証

### プラグイン統合の効果

#### 1. WXTテスト統合

- ブラウザ拡張機能特有のAPIテスト
- auto-importの解決
- fakeBrowserによる安定したモック環境

#### 2. CSS-in-JS統合

- 型安全なスタイルプロパティテスト
- ビルド時エラーの事前検出
- 開発時とテスト時の一貫性保持

#### 3. パフォーマンス最適化

- 並列テスト実行の安定性
- ビルド時間の最適化
- テスト実行速度の向上

### プラグイン設定の実践的な考慮事項

#### グローバル設定

```typescript
test: {
  globals: true,          // テストAPIのグローバル使用
  clearMocks: true,       // モックの自動クリア
  restoreMocks: true,     // モックの復元
}
```

#### E2E除外設定

```typescript
exclude: ['**/e2e/**', '**/node_modules/**'];
```

- E2EテストはPlaywrightで実行
- ユニットテストとE2Eテストの明確な分離
- 実行環境による最適化

## 各テストスイートの詳細

### ユニット・統合テスト

#### 1. `basic.test.ts`

- **目的**: テスト環境の基本動作確認
- **内容**: 簡単なアサーション確認
- **古典派アプローチ**: モック不使用の基本テスト

#### 2. `reader-utils.test.ts`

- **目的**: 純粋関数のテスト（extractContent、activateReader等）
- **特徴**:
  - 実際のJSDOMでのDocument操作
  - Mozilla Readabilityライブラリとの統合
  - コンテンツ抽出ロジックの検証
  - DOMPurifyサニタイゼーションの確認
- **古典派アプローチ**: 実際のライブラリとDOMを使用、最小限のモック

#### 3. `StyleController.test.ts`

- **目的**: スタイル管理クラスの動作検証
- **内容**:
  - テーマ切り替え機能
  - フォント設定機能
  - ストレージ連携
  - Vanilla Extract CSS-in-JS統合
- **古典派アプローチ**: 実際のsessionStorageとVanilla Extractを使用

#### 4. `ReaderView.test.tsx`

- **目的**: メインReactコンポーネントのテスト
- **内容**:
  - コンポーネントのレンダリング
  - StyleController統合
  - UIインタラクション
- **古典派アプローチ**: 実際のStyleControllerインスタンスを使用

#### 5. `StylePanel.test.tsx`

- **目的**: スタイル設定UIコンポーネントのテスト
- **内容**:
  - フォーム要素のインタラクション
  - 設定変更の処理
  - アクセシビリティ要素の確認
- **古典派アプローチ**: 実際のユーザーインタラクションをシミュレート

#### 6. `error-scenarios.test.tsx`

- **目的**: 包括的なエラーハンドリングテスト
- **内容**:
  - DOM操作エラー（Shadow DOM作成失敗等）
  - ストレージアクセスエラー
  - コンテンツ抽出エラー
  - React コンポーネントエラー
  - ブラウザ互換性エラー
- **古典派アプローチ**: 実際のエラー状況を再現してテスト

### E2Eテスト

#### Chrome拡張機能テスト

**1. `wxt-integration.spec.ts`**

- **目的**: WXT拡張機能のChrome統合テスト
- **内容**:
  - 拡張機能ロード確認
  - Browser Action動作
  - Content Script注入
  - Mozilla Readability統合
- **古典派アプローチ**: 実際にビルドされた拡張機能を使用

#### Firefox専用テスト

**2. `firefox-integration.spec.ts`**

- **目的**: Firefox環境でのReader View機能テスト
- **内容**:
  - Firefox特有のDOM動作
  - 日本語コンテンツ処理
  - CSS互換性
  - エラーハンドリング
- **古典派アプローチ**: 実際のFirefoxブラウザで動作確認

**3. `firefox-contract.spec.ts`**

- **目的**: 契約ベースのFirefoxテスト
- **内容**:
  - 実際のutils関数をブラウザに注入
  - コンテンツ抽出契約の検証
  - セキュリティ・サニタイゼーション契約
  - パフォーマンス特性の確認
- **古典派アプローチ**: 実装詳細ではなく動作契約に基づくテスト

#### 視覚的回帰テスト

**4. `visual-regression.spec.ts`**

- **目的**: UI一貫性の自動検証
- **内容**:
  - Reader View有効/無効状態
  - ライト/ダークテーマ
  - エラー状態UI
  - モバイルレスポンシブ対応
- **古典派アプローチ**: 実際のUIレンダリング結果を比較

## モックと実際のデータの使い分け

### 古典派テスト手法の採用理由

本プロジェクトでは**古典派（Classical/Detroit School）**のテスト手法を採用しています：

#### 実際のデータ・ライブラリを使用する領域

1. **DOM操作**: 実際のJSDOMとブラウザDOM
2. **Mozilla Readability**: 実際のライブラリ使用
3. **DOMPurify**: 実際のサニタイゼーション処理
4. **Vanilla Extract**: 実際のCSS-in-JS処理
5. **SessionStorage**: 実際のWebストレージAPI
6. **React Testing Library**: 実際のDOMレンダリング

#### 最小限のモックを使用する領域

1. **Vanilla Extract CSS変数**: ユニットテストでのパフォーマンス向上

   ```typescript
   vi.mock('@vanilla-extract/dynamic', () => ({
     assignInlineVars: vi.fn((vars: Record<string, string>) => vars),
   }));
   ```

2. **ReaderViewコンポーネント**: 統合テストでのフロントエンド分離

   ```typescript
   vi.mock('~/components/ReaderView', () => ({
     default: () => 'mocked-reader-view',
   }));
   ```

3. **StylePanelコンポーネント**: UIインタラクションテスト用
   ```typescript
   vi.mock('../components/StylePanel', () => ({
     default: ({ onClose, onStyleChange }) => (
       <div data-testid="style-panel">
         <button onClick={onClose}>Close</button>
         <button onClick={onStyleChange}>Change Style</button>
       </div>
     ),
   }));
   ```

### Firefox E2Eテストでの特殊対応

#### `utils-bridge.js`

Firefox E2Eテストでは、Node.js依存を除去した実際の関数を使用：

- **実際の機能**: Mozilla Readability統合、コンテンツ抽出、HTML サニタイゼーション
- **除去された依存**: React、WXTライブラリ、Node.js固有API
- **代替実装**: DOMPurifyの代わりに基本的なHTMLサニタイゼーション

## テスト実行パターン

### 開発時

```bash
bun test                    # ユニットテスト（ウォッチモード）
bun run test:e2e:headed     # E2Eテスト（ブラウザ表示）
```

### CI/CD環境

```bash
bun run ci                  # 品質チェック（lint + test + e2e + compile）
bun run test:e2e:visual:update  # 視覚的回帰テストベースライン更新
```

### ブラウザ別テスト

```bash
bun run test:e2e:chrome     # Chrome専用
bun run test:e2e:firefox    # Firefox専用
bun run test:e2e:all        # 両方のブラウザ
```

## 古典派テストの利点

1. **高い信頼性**: 実際のライブラリ・API使用で本番環境に近い条件
2. **リファクタリング耐性**: 実装詳細ではなく動作に焦点
3. **統合品質**: コンポーネント間の実際の連携を検証
4. **デバッグ容易性**: モック層が少なく問題特定が簡単
5. **メンテナンス性**: モックの更新負荷が少ない

## 今後の拡張指針

1. **視覚的回帰テスト**: 新UIステート追加時のスクリーンショット追加
2. **パフォーマンステスト**: 大容量コンテンツでの処理時間測定
3. **アクセシビリティテスト**: スクリーンリーダー対応確認
4. **セキュリティテスト**: XSS攻撃パターンの網羅的検証

本テスト構造により、堅牢で保守性の高いBrowser Extension開発を実現しています。
