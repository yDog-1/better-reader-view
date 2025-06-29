# GitHub Copilot PRレビューガイドライン

このドキュメントは、Better Reader View プロジェクトにおけるPull Requestレビュー時に、GitHub Copilotが適切な指摘と改善提案を行うためのガイドラインです。

## プロジェクト概要

- **技術構成**: WXT + React 19 + TypeScript によるブラウザー拡張機能
- **アーキテクチャ**: 関数型プログラミングアプローチ、純粋関数とShadow DOM分離
- **ローカライゼーション**: 日本語ユーザー向け、エラーメッセージとUIテキストは日本語

## PRレビューで重視すべき品質チェック項目

### 1. セキュリティレビューポイント

#### 🔒 必須チェック項目

- **XSS対策**: すべてのHTML挿入でDOMPurify.sanitize()の使用を確認
- **CSP準拠**: インラインスタイル・スクリプトの回避、nonce使用の確認
- **権限最小化**: manifest.jsonの権限が必要最小限であることを確認
- **Shadow DOM**: UI分離によるCSS/JavaScript汚染防止の実装確認

#### ❌ 禁止パターン

```typescript
// NG: サニタイゼーションなしのHTML挿入
element.innerHTML = content;

// NG: eval()やFunction()の使用
eval(userInput);

// NG: 不要な拡張権限
"permissions": ["<all_urls>", "tabs"]
```

#### ✅ 推奨パターン

```typescript
// OK: DOMPurifyによるサニタイゼーション
element.innerHTML = DOMPurify.sanitize(content);

// OK: 最小権限の拡張機能
"permissions": ["activeTab"]
```

### 2. 型安全性レビューポイント

#### 🔍 TypeScript品質チェック

- **strict設定準拠**: `tsconfig.json`のstrict設定を活用したコード
- **Type Guard使用**: `isValidArticle()`等のtype guard関数の適切な実装
- **null/undefined処理**: Optional chainingと適切なnullチェック
- **型注釈**: 複雑な型は明示的に注釈、inferenceに依存しすぎない

#### ❌ 避けるべきパターン

```typescript
// NG: any型の使用
const data: any = response;

// NG: 型アサーションの乱用
const article = response as Article;

// NG: 未チェックのnull/undefined
article.title.length; // articleがnullの可能性
```

#### ✅ 推奨パターン

```typescript
// OK: 適切な型定義
interface Article {
  title: string;
  content: string;
}

// OK: Type guardの使用
if (isValidArticle(article)) {
  // ここではarticleの型が確定
  console.log(article.title);
}
```

### 3. WXT拡張機能特有のレビューポイント

#### 📁 ディレクトリ構造の確認

- **entrypoints/**: background.ts, content script の適切な配置
- **components/**: 自動インポート対象のReactコンポーネント
- **utils/**: 純粋関数とビジネスロジックの分離

#### 🔧 WXT設定確認

- **自動インポート**: WXTの自動インポートシステムを活用
- **ビルド設定**: Chrome/Firefox別ビルドの適切な設定
- **開発設定**: Hot reloadとデバッグ環境の維持

#### ❌ WXT アンチパターン

```typescript
// NG: 手動インポート（自動インポート対象）
import ReaderView from '../components/ReaderView';

// NG: entrypoints外でのdefineBackground使用
defineBackground(() => {}); // entrypoints/background.ts以外で使用
```

### 4. 関数型プログラミングレビューポイント

#### 🧩 純粋関数の確認

- **副作用の分離**: DOMアクセス、API呼び出しを純粋関数から分離
- **テスタビリティ**: 単体テストが容易な関数設計
- **immutability**: 引数オブジェクトの変更回避

#### ✅ 純粋関数の例

```typescript
// OK: 純粋関数（副作用なし、テスト可能）
export const extractContent = (
  document: Document
): { title: string; content: string } | null => {
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (!isValidArticle(article)) {
    return null;
  }

  return {
    title: article.title,
    content: DOMPurify.sanitize(article.content),
  };
};
```

### 5. 日本語化レビュー基準

#### 🌐 ローカライゼーション品質

- **エラーメッセージ**: すべて日本語、統一された敬語レベル
- **UIテキスト**: ユーザー向けテキストの一貫性
- **コメント**: JSDocコメントの日本語記述品質

#### ✅ 日本語化パターン

```typescript
// OK: 統一された日本語エラーメッセージ
throw new ReaderViewError({
  type: ReaderViewErrorType.CONTENT_EXTRACTION_FAILED,
  message: 'コンテンツの抽出に失敗しました',
  originalError,
});

/**
 * 記事コンテンツを抽出してサニタイゼーションを実行
 * @param document - 解析対象のDocumentオブジェクト
 * @returns 抽出された記事データまたはnull
 */
```

### 6. React 19 & Vanilla Extract レビューポイント

#### ⚛️ React品質チェック

- **hooks使用**: 適切なuseState, useEffect, useMemoの使用
- **再レンダリング最適化**: 不要な再レンダリングの防止
- **Shadow DOM統合**: createShadowRootUiの適切な使用

#### 🎨 Vanilla Extract確認

- **型安全CSS**: CSS-in-JSの型安全性活用
- **テーマシステム**: ダーク/ライトモード対応
- **パフォーマンス**: 静的CSS生成の活用

### 7. テストレビューポイント

#### 🧪 テスト戦略確認

- **Unit Tests**: 純粋関数のテスト網羅性
- **Component Tests**: @testing-library/reactによるユーザー視点テスト
- **E2E Tests**: Playwright拡張機能テストの実ブラウザー検証
- **CI対応**: headlessモード自動切り替えの確認

#### ✅ テストパターン

```typescript
// OK: 純粋関数のテスト
describe('extractContent', () => {
  it('正常な記事からコンテンツを抽出する', () => {
    const mockDocument = createMockDocument();
    const result = extractContent(mockDocument);

    expect(result).toEqual({
      title: 'テスト記事',
      content: 'サニタイゼーション済みコンテンツ',
    });
  });
});
```

### 8. パフォーマンスレビューポイント

#### ⚡ 最適化確認

- **メモリリーク防止**: Shadow DOM、React rootの適切なクリーンアップ
- **Bundle size**: 不要な依存関係の排除
- **ローディング時間**: 遅延ローディングの活用

### 9. エラーハンドリングレビューポイント

#### 🚨 エラー処理確認

- **カスタムエラー型**: ReaderViewErrorの適切な使用
- **ユーザーフレンドリー**: 日本語エラーメッセージでのユーザー通知
- **ログ記録**: デバッグ用ログの適切な実装

### 10. 品質保証チェックリスト

#### ✅ マージ前必須チェック

- [ ] `bun run ci` パス（lint + test + e2e + compile）
- [ ] TypeScript strict設定でのコンパイル成功
- [ ] セキュリティ脆弱性なし（DOMPurify使用確認）
- [ ] 日本語化完了（エラーメッセージ、UIテキスト）
- [ ] Shadow DOM分離確認
- [ ] E2Eテスト成功（拡張機能の実動作確認）

## レビュー時の指摘テンプレート

### セキュリティ指摘

```
🔒 セキュリティ: HTMLの直接挿入を検出しました。DOMPurify.sanitize()の使用を推奨します。

参考実装: utils/reader-utils.ts:40
```

### 型安全性指摘

```
🔍 型安全性: any型の使用を避け、適切な型定義を行ってください。

推奨: インターフェースまたはtype guardの使用
```

### パフォーマンス指摘

```
⚡ パフォーマンス: Shadow DOMのクリーンアップ処理が不十分です。メモリリークの可能性があります。

参考実装: utils/reader-utils.ts:116-153
```

このガイドラインに従って、プロジェクトの品質維持と日本語ユーザー向けの最適なブラウザー拡張機能開発をサポートしてください。
