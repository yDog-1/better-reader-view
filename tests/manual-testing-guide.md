# Manual Testing Guide: Settings Persistence

This guide provides comprehensive instructions for manually testing the settings persistence functionality of the Better Reader View extension.

## Prerequisites

1. **Load Extension**:

   - Open Chrome/Chromium browser
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select `.output/chrome-mv3-dev` folder
   - Note the extension ID for debugging

2. **Open DevTools**:
   - Press F12 or right-click → "Inspect"
   - Go to "Application" tab → "Storage" → "Extension Storage"
   - Find your extension ID to monitor storage changes

## Test Cases

### 1. Basic Settings Persistence

**Test Steps:**

1. Navigate to a content-rich page (e.g., Wikipedia article, news article)
2. Click the Better Reader View extension icon in toolbar
3. Verify reader view activates with default settings:
   - Light theme
   - Medium font size
   - Sans-serif font family
4. Open style panel (settings button in reader view)
5. Change settings:
   - Theme: Light → Dark
   - Font Size: Medium → Large
   - Font Family: Sans-serif → Serif
6. Close style panel
7. Deactivate reader view (click extension icon)
8. **Reactivate reader view**

**Expected Result:**

- All custom settings should persist (Dark theme, Large font, Serif family)
- Settings should be immediately applied when reader view reactivates

### 2. Cross-Page Persistence

**Test Steps:**

1. With custom settings from Test 1, navigate to a different article
2. Activate reader view on the new page
3. Verify settings persist across different pages

**Expected Result:**

- Same custom settings applied on different content
- No reset to defaults when changing pages

### 3. Browser Session Persistence

**Test Steps:**

1. Set custom settings as in Test 1
2. **Close browser completely** (all windows)
3. Restart browser
4. Navigate to any article page
5. Activate reader view

**Expected Result:**

- Settings should persist across browser restarts
- No loss of customization after session restart

### 4. Storage Verification

**DevTools Monitoring:**

1. Open DevTools → Application → Storage → Extension Storage
2. Find your extension ID
3. Monitor storage changes during testing:

**Expected Storage Structure:**

```json
{
  "readerViewStyleConfig": {
    "theme": "dark",
    "fontSize": "large",
    "fontFamily": "serif"
  }
}
```

**Session Storage (while reader view is active):**

```json
{
  "readerViewState": {
    "isActive": true,
    "url": "https://example.com/article",
    "title": "Article Title"
  }
}
```

### 5. Error Handling

**Test Steps:**

1. Try activating reader view on pages without article content:
   - Search pages (Google search results)
   - Empty pages (about:blank)
   - Complex web apps (Gmail, GitHub dashboard)

**Expected Result:**

- Should show Japanese error popup: "記事が見つかりませんでした。"
- Extension should not crash or interfere with page functionality
- Settings should remain intact even after errors

### 6. Settings Reset

**Test Steps:**

1. Set custom settings
2. Open style panel
3. Click "リセット" (Reset) button
4. Verify reset functionality

**Expected Result:**

- Settings should revert to defaults (Light, Medium, Sans-serif)
- Reset should persist across activations

## Debugging

### Console Errors

- Check browser console for any JavaScript errors
- Extension errors appear in service worker console

### Storage Issues

- Monitor Extension Storage in DevTools during changes
- Verify data structure matches expected format
- Check both Local and Session storage areas

### Performance

- Reader view should activate within 1000ms
- Style changes should apply immediately
- No memory leaks during repeated activation/deactivation

## Test Results Template

Use this template to document your test results:

```
## Test Results - [Date]

### Basic Settings Persistence: ✅/❌
- Default settings display correctly: ___
- Settings persist after deactivation/reactivation: ___
- Custom settings apply correctly: ___

### Cross-Page Persistence: ✅/❌
- Settings maintained across different pages: ___
- No unexpected resets: ___

### Browser Session Persistence: ✅/❌
- Settings survive browser restart: ___
- No loss of customization: ___

### Storage Verification: ✅/❌
- Correct data structure in Extension Storage: ___
- Session storage updates properly: ___

### Error Handling: ✅/❌
- Graceful failure on non-article pages: ___
- Japanese error messages display: ___
- No crashes or page interference: ___

### Additional Notes:
- Performance observations: ___
- Any unexpected behaviors: ___
- Browser version tested: ___
```

## Troubleshooting

### Settings Not Persisting

1. Check Extension Storage in DevTools
2. Verify extension has storage permissions
3. Try reloading extension
4. Check for console errors

### Reader View Not Activating

1. Try on different article pages
2. Check if page has sufficient text content
3. Verify extension is loaded and active
4. Check for content script injection errors

### Style Changes Not Applying

1. Verify Shadow DOM is being created
2. Check CSS injection in Shadow DOM
3. Monitor theme class changes
4. Verify CSS custom properties are applied

This comprehensive testing approach ensures that the settings persistence functionality works reliably across all use cases and edge conditions.
