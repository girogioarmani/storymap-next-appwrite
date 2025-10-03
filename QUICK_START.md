# 🚀 Quick Start Guide

## ✅ What's New

### 1. SPIDR Breakdown Stories Are Hidden
- Breakdown stories only appear in the SPIDR modal
- Main journey view stays clean
- Badge shows breakdown count on parent stories

### 2. Releases Feature - Horizontal Swim Lanes
- Create releases (MVP, Phase 1, etc.)
- Stories grouped by release
- Backlog for unassigned stories
- Horizontal lanes spanning all steps

---

## 🎯 Test It Now!

### Open the App:
```bash
http://localhost:3000
```

### Sign In With:
- Email: marc@test.com
- Password: 12345678

### Test Flow:
1. **Select Epic & Journey**
2. **Click "Add Release"** → Choose "🎯 MVP"
3. **Create Stories** in different steps
4. **Test SPIDR** → Hover story → "SPIDR Breakdown"
5. **See Organization** → Stories in backlog, release lanes visible

---

## 🎨 Visual Structure

```
[Epic] [Journey]
├─ 🎯 MVP Release
│  └─ [Step1] → [Step2] → [Step3]
│     Stories    Stories    Stories
│
├─ 🚀 Phase 1
│  └─ [Step1] → [Step2] → [Step3]
│     Stories    Stories    Stories
│
└─ 📦 Backlog
   └─ [Step1] → [Step2] → [Step3]
      Stories    Stories    Stories
```

---

## 🔑 Key Features

| Feature | Icon | What It Does |
|---------|------|--------------|
| Release Lanes | 🎯🚀✨ | Horizontal bands grouping stories |
| THEN Indicators | → | Show step flow |
| OR Indicators | (amber) | Show alternatives |
| Breakdown Badge | 🔀 | Count of SPIDR breakdowns |
| Priority | 🔴🟡🟢⚪ | MoSCoW prioritization |

---

## 📝 Quick Actions

### Create Release:
1. Click "Add Release"
2. Choose preset or custom name
3. Done!

### Create Story:
1. Click "+" in any step
2. Enter title, priority
3. Story appears in Backlog

### SPIDR Breakdown:
1. Hover over story
2. Click "SPIDR Breakdown"
3. Add horizontal/vertical breakdowns

### Delete Release:
1. Click trash icon on release
2. Confirm
3. Stories move to backlog

---

## ✨ Next Features (Coming Soon)

- Drag stories between releases
- Assign release when creating story
- Release editing
- Color-coded releases

---

## 🐛 If Something's Wrong

### Dev Server:
```bash
cd /Users/marcneves/storymap-next-appwrite
npm run dev
```

### Check Database:
- Go to http://localhost/console
- Check collections: releases, stories
- Verify releaseId field exists in stories

### Re-run Migration:
```bash
npm run add-releases
```

---

## 📚 Documentation

- `RELEASES_COMPLETE.md` - Full implementation details
- `IMPLEMENTATION_STATUS.md` - Phase 1 & 2 breakdown
- `TEST_REPORT.md` - Comprehensive testing results
- `TESTING_SUMMARY.md` - Testing overview

---

**Status:** ✅ READY TO USE

Enjoy your new story mapping tool with releases! 🎉
