# Classical/Detroit学派テスト手法リファクタリングガイド

## 🎯 目標

現在のテストコードを**Classical/Detroit学派**のアプローチに移行し、過剰なモックを削除して実際の実装に対するテストに変更する。

## 📖 背景知識

### Classical vs Mockist Testing

| Classical/Detroit学派  | Mockist/London学派           |
| ---------------------- | ---------------------------- |
| 実際の依存関係を使用   | 依存関係を積極的にモック     |
| 状態ベースの検証       | インタラクションベースの検証 |
| 統合テスト的性質       | 単体テスト的性質             |
| より信頼性の高いテスト | より高速なテスト             |

### Classical Testingの原則

1. **実際の実装を使用**: モックは最小限に留める
2. **動作を検証**: 実装詳細ではなく結果を確認
3. **統合的テスト**: コンポーネント間の実際の相互作用をテスト

## 🚀 実行手順

### Phase 1: 現状分析

#### 1.1 グローバルモックの調査

```bash
# テストセットアップファイルを確認
find . -name "setup.*" -o -name "setupTests.*" -o -name "vitest.config.*" -o -name "jest.config.*"
```

**調査ポイント:**

- CSS-in-JSライブラリのモック
- UI框架（React/Vue等）の過剰なモック
- 汎用ライブラリのモック
- グローバルなコンポーネントモック

#### 1.2 個別テストファイルの分析

```bash
# モック使用状況を調査
grep -r "vi.mock\|jest.mock\|mock" tests/ --include="*.test.*" --include="*.spec.*"
```

**分析項目:**

- 手動で作成されたコンポーネントモック
- CSS/スタイルファイルのモック
- ユーティリティ関数のモック
- 外部ライブラリのモック

#### 1.3 削除優先順位の決定

1. **高優先度**: CSS-in-JS、自作コンポーネント、純粋関数内ライブラリ
2. **中優先度**: 設定ファイル、定数ファイル
3. **低優先度**: 複雑な外部ライブラリ（慎重に判断）

### Phase 2: 段階的リファクタリング

> **重要**: 各ステップ後に必ず全テストを実行してください

#### Step 2.1: グローバルモック整理

**2.1.1 CSS-in-JSモックの削除**

```javascript
// 削除対象例
vi.mock('../styles/theme.css', () => ({
  theme: 'mocked-theme',
  variables: { color: 'red' },
}));
```

**2.1.2 ビルドツール設定の更新**

```javascript
// vite.config.js / vitest.config.js
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [
    // 既存プラグイン,
    vanillaExtractPlugin(), // CSS-in-JS用プラグイン追加
  ],
});
```

**2.1.3 テスト実行**

```bash
npm test  # または yarn test, pnpm test, bun test
```

#### Step 2.2: コンポーネントテストのモック削除

**2.2.1 手動モックの削除**

```javascript
// 削除前
vi.mock('../components/Button', () => ({
  default: ({ onClick, children }) => (
    <button data-testid="mocked-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// 削除後: 実際のコンポーネントを使用
import Button from '../components/Button';
```

**2.2.2 テストアサーションの更新**

```javascript
// 更新前
expect(screen.getByTestId('mocked-button')).toBeInTheDocument();

// 更新後: 実際の動作を検証
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
```

**2.2.3 CSS class名の実際値対応**

```javascript
// 更新前
const element = container.querySelector('.mocked-class');

// 更新後: 実際のCSS class pattern
const element = container.querySelector('[class*="button"]');
// または
const element = screen.getByRole('button');
```

**2.2.4 テスト実行**

```bash
npm test
```

#### Step 2.3: ユーティリティ・純粋関数テストの最適化

**2.3.1 不要なコンポーネントモックの削除**

```javascript
// 削除対象: 純粋関数テストでのコンポーネントモック
vi.mock('../components/SomeComponent', () => ({
  default: () => 'mocked',
}));
```

**2.3.2 純粋関数の実際の動作テスト**

```javascript
// 良い例: 実際のライブラリを使用
import { formatDate } from '../utils/dateUtils';
import { DateTime } from 'luxon'; // 実際のライブラリ

it('formats date correctly', () => {
  const result = formatDate('2023-01-01');
  expect(result).toBe('January 1, 2023');
});
```

**2.3.3 副作用部分の適切なモック**

```javascript
// 保持すべきモック例
vi.mock('../api/client', () => ({
  fetchUser: vi.fn(),
}));
```

**2.3.4 テスト実行**

```bash
npm test
```

#### Step 2.4: 統合テスト環境の確認

**2.4.1 基本テスト環境の動作確認**

```javascript
// basic.test.js を作成
describe('Test Environment', () => {
  it('basic assertions work', () => {
    expect(1 + 1).toBe(2);
  });

  it('DOM environment works', () => {
    const div = document.createElement('div');
    expect(div).toBeInstanceOf(HTMLElement);
  });
});
```

**2.4.2 ライブラリ統合の確認**

```javascript
// 実際のライブラリ使用確認
it('real library integration works', () => {
  // CSS-in-JS, UI框架等の実際の動作確認
});
```

**2.4.3 テスト実行**

```bash
npm test
```

### Phase 3: 品質保証

各フェーズ完了後に以下を実行：

```bash
# コード品質チェック
npm run lint     # または yarn lint, pnpm lint
npm run format   # または prettier --write .
npm test         # 全テスト実行
npm run build    # または yarn build, pnpm build
npm run type-check # TypeScriptの場合
```

### Phase 4: コミット整理

論理的な単位でコミットを作成：

```bash
# 例: 段階的コミット
git add tests/setup.js vitest.config.js
git commit -m "refactor: グローバルCSS-in-JSモックを削除しプラグイン統合"

git add tests/ComponentA.test.js
git commit -m "refactor: ComponentAテストのモック削除と実装統合"

git add tests/utils.test.js
git commit -m "refactor: ユーティリティテストを純粋関数テストに集中"

git add tests/basic.test.js
git commit -m "feat: テスト環境基盤の動作確認テスト追加"
```

## 🔍 判断基準

### ✅ 削除すべきモック

**CSS-in-JSライブラリ**

```javascript
// 削除対象
vi.mock('@emotion/styled', () => ({ ... }));
vi.mock('styled-components', () => ({ ... }));
vi.mock('@vanilla-extract/css', () => ({ ... }));
```

**自作コンポーネント**

```javascript
// 削除対象
vi.mock('../components/Button', () => ({ ... }));
vi.mock('./Header.vue', () => ({ ... }));
```

**純粋関数で使用されるライブラリ**

```javascript
// 削除対象
vi.mock('lodash', () => ({ ... }));
vi.mock('date-fns', () => ({ ... }));
```

**設定・定数ファイル**

```javascript
// 削除対象
vi.mock('../config/constants', () => ({ ... }));
```

### ⚠️ 保持すべきモック

**外部API呼び出し**

```javascript
// 保持
vi.mock('../api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));
```

**ファイルシステム操作**

```javascript
// 保持
vi.mock('fs', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));
```

**時間依存の処理**

```javascript
// 保持
vi.mock('../utils/timer', () => ({
  getCurrentTime: vi.fn(() => new Date('2023-01-01')),
}));
```

**ランダム値生成**

```javascript
// 保持
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'fixed-uuid'),
}));
```

**ブラウザAPI（テスト環境で利用不可能な場合）**

```javascript
// 保持（必要に応じて）
vi.mock('../utils/localStorage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));
```

## 📊 期待される結果

### テスト品質の向上

- ✅ 実際の実装に対するテスト
- ✅ コンポーネント間の実際の相互作用確認
- ✅ CSS-in-JSシステムの統合動作確認
- ✅ ライブラリの実際の動作確認

### 保守性の向上

- ✅ モック同期の必要性削減
- ✅ 実装変更時のテスト修正負荷軽減
- ✅ より信頼性の高いリファクタリング

### Classical Testing Principlesへの準拠

- ✅ 状態ベースの検証
- ✅ 実際の依存関係使用
- ✅ 統合テストとしての性質

## ⚠️ 注意事項

### 段階的実施

- 各変更は小さく段階的に実施
- テスト失敗時は前のステップに戻り原因分析
- 一度に大量のモックを削除しない

### パフォーマンス考慮

- 実際の実装使用によるテスト実行時間増加は許容範囲内
- CI/CD環境での実行時間を監視
- 必要に応じてテスト並列化を検討

### チーム合意

- Classical vs Mockist approachの方針をチーム内で合意
- リファクタリング範囲と優先度を明確化
- 段階的移行のスケジュール策定

### E2Eテストとの棲み分け

- 本リファクタリングは単体・統合テストが対象
- E2Eテストは別途検討・実装
- テストピラミッドの適切な構成を維持

## 🔧 技術スタック別の考慮事項

### React + Jest/Vitest

- React Testing Library使用推奨
- CSS Modules/Styled Components/Emotion等のプラグイン設定
- MSW等のAPI mocing tool活用

### Vue + Vitest

- Vue Test Utils使用
- SFCの適切な処理設定
- Pinia/Vuex等の状態管理との統合

### Angular + Jasmine/Jest

- Angular Testing Utilities活用
- Dependency Injection考慮
- HttpClientTestingModule等の公式モックツール使用

## 📚 参考資料

- [Classical vs Mockist testing](https://martinfowler.com/articles/mocksArentStubs.html)
- [Test Doubles](https://martinfowler.com/bliki/TestDouble.html)
- [Unit Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

このガイドに従って段階的にリファクタリングを実施することで、より信頼性が高く保守しやすいテストコードを構築できます。
