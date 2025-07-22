# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

- `bun dev` - Chrome用開発サーバー起動
- `bun run dev:firefox` - Firefox用開発サーバー起動
- `bun run build` - Chrome用プロダクションビルド
- `bun run build:firefox` - Firefox用プロダクションビルド
- `bun run zip` - Chrome用配布zipファイル作成
- `bun run zip:firefox` - Firefox用配布zipファイル作成
- `bun run compile` - ファイル出力なしの型チェック
- `bun run test` - テストのウォッチモード実行 (`bunx vitest`)
- `bun run test run` - テストの一回のみ実行
- `bun run test <pattern>` - 特定のテストファイル実行 (例: `bun test ReaderView`)
- `bun run lint` - ESLint実行
- `bun fmt` - Prettierによるフォーマット (`prettier --write .`)
- `bun run fix` - 自動修正 (lint + format): `eslint . --fix && prettier --write .`

## Gitワークフロー

- ユーザーの明示的な許可なしにコミットしない
- コミット前は必ず実行: `bun run fix && bun run test && bun run compile`

## プロジェクトの方向性（PR#13〜PR#38の分析結果）

このプロジェクトは、WXTフレームワークを使用したブラウザ拡張機能として、以下の明確な技術的発展を遂げています：

### 主要な開発方針

1. **WXTベストプラクティスの徹底実装**

   - フレームワーク規約に準拠した設計パターンの採用
   - 型安全性とパフォーマンスの最適化

2. **SOLID原則に基づく設計改善**

   - 単一責任原則（SRP）に基づくアーキテクチャリファクタリング
   - オープン・クローズド原則（OCP）準拠のプラガブルシステム実装

3. **関数型プログラミングパラダイムの採用**

   - グローバル状態の排除と純粋関数アプローチ
   - 副作用の最小化とテスタビリティの向上

4. **統一エラーハンドリングシステム**

   - 日本語ユーザーメッセージでの一貫したエラー体験
   - WXT環境に最適化されたエラー処理

5. **Classical Testing（古典学派）アプローチ**
   - 実装詳細ではなく行動の単位をテスト
   - リファクタリング耐性の向上

### 最近の主要実装 (PR#13〜PR#38)

#### 🧪 テスト品質革命 (PR#13)

- Mockist学派からClassical学派への完全移行
- 74→238テストに拡張、実用的なテストカバレッジ達成
- 実装詳細からユーザー体験重視の検証に転換

#### 🎨 スタイリングシステム進化 (PR#15, #17)

- vanilla-extractからDocument.adoptedStyleSheetsへ移行
- Shadow DOM完全対応によるCSS分離強化
- レンダリングバグの根本解決

#### 💾 永続化ストレージ実装 (PR#20)

- sessionStorageからbrowser.storage.localへ移行
- タブ間・セッション間での一貫したユーザー体験

#### 🏗️ アーキテクチャリファクタリング (PR#33, #35)

- ReaderViewManagerのSRP違反修正
- グローバル状態を関数型アプローチに置き換え
- Facade Pattern + Dependency Injectionによる疎結合設計

#### 🎨 プラガブルテーマシステム (PR#36)

- OCP準拠のテーマ拡張システム
- 型修正なしでカスタムテーマ追加可能
- ThemeRegistry + ThemeDefinitionによる動的管理

#### ⚠️ 統一エラーハンドリング (PR#37)

- BaseReaderViewError基底クラスによる一貫した構造
- 22種類の具体的エラークラス実装
- 日本語メッセージ統一とWXT環境最適化

#### 📊 包括的テストカバレッジ (PR#38)

- パフォーマンステスト（メモリ使用量監視）
- ブラウザ互換性テスト（CSP制限対応）
- エラーハンドリング全範囲カバー

## アーキテクチャ概要

WXTフレームワークを基盤とし、関数型プログラミングと純粋関数によるリーダービュー実装のブラウザ拡張機能です。

### WXTベストプラクティス実装

このプロジェクトは以下のWXTフレームワークベストプラクティスを徹底的に実装しています：

#### 統一エラーハンドリングシステム (`utils/errors.ts`)

```typescript
// WXT環境検出とエラー分類
export abstract class BaseReaderViewError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    public readonly userMessage: string = 'エラーが発生しました',
    cause?: Error
  ) {
    super(message, { cause });
    this.context = context;
    this.userMessage = userMessage;
    /* WXT最適化実装 */
  }
}
```

#### プラガブルテーマシステム (`utils/ThemeRegistry.ts`)

```typescript
// OCP準拠の拡張可能テーマ管理
export interface ThemeDefinition {
  id: string;
  name: string;
  className: string;
  cssVariables: Record<string, string>;
}
```

#### 型ガードシステム (`utils/typeGuards.ts`)

```typescript
// DOM操作の型安全性保証
export function isValidDocument(
  doc: unknown
): doc is Document & { body: HTMLElement };
export function isReactRoot(root: unknown): root is ReactDOM.Root;
export function canAttachShadow(element: unknown): element is HTMLElement;
```

#### リアクティブストレージシステム (`utils/storage-config.ts`)

```typescript
// WXT browser API統合の型安全ストレージ
export interface StorageConfig<T> {
  key: string;
  area: StorageArea;
  defaultValue: T;
}
```

### コア実装

#### Background Script (`entrypoints/background.ts`)

- ブラウザアクション（拡張機能アイコンクリック）の処理
- アクティブタブへのコンテンツスクリプト注入

#### Content Script (`entrypoints/content/index.tsx`)

- `createReaderViewManager`ファクトリ関数を使用したリーダービュー制御
- `StyleController`によるテーマ管理の初期化
- 日本語エラーメッセージによるユーザー体験
- Reactベースのポップアップ通知システム

#### アーキテクチャ分離システム (`utils/`)

**ReaderViewManager (Facade Pattern):**

- 複数の専門クラスを統合する統一インターフェース
- 関数型アプローチによる状態管理
- Shadow DOM ライフサイクル制御

**専門クラス (Single Responsibility Principle):**

- `DOMManager`: Shadow DOM操作専門
- `ReactRenderer`: React レンダリング専門
- `LifecycleManager`: ライフサイクル協調専門
- `StyleController`: テーマ・スタイル管理専門

**主要関数:**

- `extractContent(document: Document)`: Mozilla Readabilityを使用した記事抽出

  - `Article`インターフェースでメタデータ（タイトル、コンテンツ、著者等）を返却
  - 副作用回避のためのdocumentクローニング
  - DOMPurifyによるXSS脆弱性対策

- `activateReader(document: Document)`: Shadow DOMリーダービュー作成

  - `createReaderViewManager`による疎結合なコンポーネント連携
  - 元ページの復元可能な保存
  - 型安全なブール値リターン

- `deactivateReader()`: 元ページコンテンツの復元
  - Shadow DOMリーダービューの削除
  - ストレージ状態のクリーンアップ

#### React Components (`components/`)

- `ReaderView.tsx`: メインリーダービューコンポーネント（記事コンテンツ＋スタイル制御）
- `StylePanel.tsx`: テーマ、フォントサイズ、フォントファミリー設定パネル
- `popupMsg.tsx`: トースト形式のエラー通知システム
- `ui.tsx`: 将来拡張用のプレースホルダーコンポーネント

### リーダービューフロー

1. ユーザーが拡張機能アイコンをクリック → バックグラウンドスクリプトがコンテンツスクリプトを注入
2. コンテンツスクリプトが`StyleController`を初期化し、`browser.storage.local`の状態を確認
3. **非アクティブの場合**:
   - `extractContent()`でMozilla Readabilityを使用してコンテンツ抽出
   - スタイル分離のためのShadow DOMコンテナ作成
   - `StylePanel`制御付きReact `ReaderView`コンポーネントのレンダリング
   - `browser.storage.local`に状態を永続化保存
4. **アクティブの場合**:
   - Shadow DOMリーダービューの削除
   - ブラウザストレージ状態のクリア

### 技術スタック

- **フレームワーク**: WXT (Web Extension Toolkit) + React 19
- **コンテンツ解析**: @mozilla/readability（記事抽出）
- **HTML無害化**: DOMPurify（XSS脆弱性対策）
- **状態管理**: Browser storage API (`browser.storage.local`)
- **スタイルシステム**: CSS-in-JS + Shadow DOM分離 + `StyleController`
- **テスティング**: Vitest + WXTテスティングユーティリティ + JSDOM
- **型安全性**: TypeScript strict configuration
- **ビルドツール**: Bun（パッケージマネージャー＋タスクランナー）

### WXTディレクトリ構造

WXTはConvention over Configurationアプローチに従います：

- **`entrypoints/`**: 拡張機能エントリーポイント（background, content scripts）
- **`components/`**: Reactコンポーネント（プロジェクト全体で自動インポート）
- **`utils/`**: コアユーティリティ（プロジェクト全体で自動インポート）:
  - `reader-utils.ts`: メインリーダーロジックとReaderViewManager
  - `errors.ts`: 統一エラーハンドリングシステム
  - `StyleController.ts`: テーマ・スタイル管理
  - `StyleSheetManager.ts`: Shadow DOM用CSS注入
  - `ThemeRegistry.ts`: プラガブルテーマシステム
  - `typeGuards.ts`: DOM操作型ガード関数
  - `storage-config.ts`: リアクティブストレージ設定
  - `types.ts`: TypeScript型定義とインターフェース
  - `theme.css`: テーマ用CSS変数
- **`public/`**: 静的ファイル（拡張機能アイコン）
- **`tests/`**: Vitestテストファイル (`*.test.ts`, `*.spec.ts`)

**自動インポートシステム:**
WXTは`components/`, `utils/`, `hooks/`, `composables/`ディレクトリから自動インポートします。

## テスティング戦略

このプロジェクトはVitestとWXTテスティングユーティリティを使用したブラウザ拡張機能の包括的テストを実装しています。

### Classical Testing（古典学派）アプローチ

PR#13で確立されたClassical/Detroit学派のテスト戦略：

- **実装詳細ではなく行動の単位をテスト**
- **実際のユーザー体験に焦点**
- **リファクタリング耐性の向上**
- **モックの最小化、実装の使用**

### WXTテスティングセットアップ

- **テストランナー**: Vitest + `happy-dom`（高速DOM シミュレーション）
- **拡張機能API**: WXT `WxtVitest`プラグイン + `fakeBrowser`（モッキング）
- **DOM テスティング**: JSDOM（複雑なdocument操作テスト）
- **React テスティング**: `@testing-library/react`（コンポーネントテスト）
- **テストファイル**: `*.test.ts` または `*.spec.ts`

### 包括的テストカバレッジ（238テスト）

**コア関数** (`reader-utils.test.ts`):

- Mozilla Readabilityを使用したコンテンツ抽出
- Shadow DOMレンダリングとライフサイクル管理
- ReaderViewManager状態処理

**React コンポーネント** (`ReaderView.test.tsx`, `StylePanel.test.tsx`):

- コンポーネントレンダリングとユーザーインタラクション
- StyleController統合
- テーマ切り替えとスタイル適用

**システム統合** (`*Integration.test.ts`):

- エンドツーエンドのリーダービュー有効化/無効化
- コンポーネント間通信
- ブラウザストレージ永続化

**パフォーマンステスト**:

- メモリ使用量監視（200MB閾値）
- リーダービュー有効化速度ベンチマーク
- ガベージコレクション動作確認

**ブラウザ互換性テスト**:

- CSP制限シミュレーション
- Chrome/Firefox横断サポート
- セキュリティ制約下での動作確認

**エラーハンドリングテスト**:

- 22種類のエラークラス検証
- 日本語メッセージ一貫性確認
- WXT環境での適切なエラー処理

### スタイリングアーキテクチャ

Document.adoptedStyleSheetsベースのスタイリングシステム（PR#17で実装）：

- **CSS モジュール**: `ReaderView.css`, `StylePanel.css`, `theme.css`を`?inline`文字列でインポート
- **テーマシステム**: `utils/theme.css`定義のCSS カスタムプロパティ（変数）
- **Shadow DOM**: ページコンフリクト回避のためのShadow DOM内スタイル注入
- **StyleController**: テーマ切り替えとスタイル注入管理

#### CSS コンポーネントテスト例

```typescript
// テーマ適用テスト
expect(element).toHaveClass(styleController.getThemeClass());

// Shadow DOM内スタイル注入テスト
expect(shadowRoot.querySelector('style')).toContainText('theme-light');

// プラガブルテーマ機能テスト
const customTheme: ThemeDefinition = {
  id: 'high-contrast',
  name: 'ハイコントラスト',
  className: 'theme-high-contrast',
  cssVariables: { '--bg-color': '#000000' },
};
expect(() => styleController.registerTheme(customTheme)).not.toThrow();
```

## 開発パターン

### SOLID原則とデザインパターン

- **単一責任原則**: 各クラスが単一の明確な責任を持つ
- **オープン・クローズド原則**: プラガブルテーマシステムで拡張可能
- **Facade Pattern**: ReaderViewManagerが複雑なサブシステムを統合
- **Dependency Injection**: 疎結合設計でテスタビリティ向上

### 関数型プログラミング原則

- **純粋関数**: 副作用のないテスト可能な関数に分離
- **型安全性**: TypeScript strict configurationと型ガード
- **不変性**: イミュータブルデータと純粋関数合成の重視
- **グローバル状態排除**: ファクトリ関数による局所化された状態管理

### エラーハンドリング・セキュリティ

- **統一エラーハンドリング**: 日本語ユーザーメッセージでの一貫した体験
- **型安全性**: `as any`の完全排除、型ガードによる安全な型変換
- **HTML セキュリティ**: DOMPurify無害化によるXSS脆弱性対策
- **WXT環境最適化**: `import.meta.env.MODE`による環境判定

## WXT拡張機能グローバル設定

ESLintはWXT固有のグローバル変数で設定：

- `defineBackground`: バックグラウンドスクリプトエントリーポイント用
- `defineContentScript`: コンテンツスクリプトエントリーポイント用
- `createShadowRootUi`: Shadow DOM UI作成用（現在未使用）

## 今後の開発指針

このプロジェクトは以下の方向性で継続的な品質向上を図っています：

1. **WXTベストプラクティスの更なる深化**
2. **パフォーマンス監視とメモリ効率の継続的改善**
3. **ブラウザ互換性の拡大とセキュリティ強化**
4. **アクセシビリティ対応とユーザー体験の向上**
5. **テストカバレッジの維持と品質指標の向上**
