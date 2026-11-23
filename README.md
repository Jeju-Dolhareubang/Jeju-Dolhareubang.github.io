# PARK DANBI — Portfolio

UI/UX Designer Park Danbi's portfolio website.

## Live site

[jeju-dolhareubang.github.io](https://jeju-dolhareubang.github.io/)

## Local preview

This is a static site with no build step. Open `index.html` directly in a browser, or serve the project root with any local static server.

## 공통 헤더 / 푸터

`partials/header.html`, `partials/footer.html` 을 수정한 뒤 아래를 실행하면 모든 페이지에 반영됩니다.

```
python3 tools/sync-partials.py
```

## 폰트

한글 폰트 ONE Mobile(Regular · Title)은 사이트에서 쓰는 글자만 남긴 작은 파일(`assets/fonts/ONE-Mobile-*-subset.woff2`)을 씁니다.
**새 한글 글자를 추가했다면** 아래를 다시 실행하세요. (없는 글자는 Pretendard로 대체되어 보입니다.)

```
npm i subset-font
node tools/subset-fonts.mjs
```
