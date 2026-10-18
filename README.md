# AGENT FROG: interactive product demo

A scroll-driven walkthrough of AGENT FROG, a career tool that tailors resumes and cover letters from a student's own checked profile. The page opens on dark suit cloth that is cut open as you scroll. Underneath, nine short sections show the product with small working examples.

1. **Your materials.** Add a resume and an optional LinkedIn PDF.
2. **Your profile.** Confirm or edit every fact read from them.
3. **Tailoring.** Pick a job and see which requirements your profile backs.
4. **Review.** Compare each changed line with your original, and accept, edit or remove it.
5. **Cover letter.** Read a draft that leaves your personal reasons blank, with the reasoning behind each paragraph.
6. **Export.** See the final resume as it prints and as a screening system reads it.
7. **Prep.** Practice interview answers with a live Situation, Task, Action, Result check.
8. **My Applications.** Track statuses and follow-up reminders.
9. **My Profile.** Keep the source information current.

**Everything here is fictional.** The student, the employers and the documents are sample data. Nothing is uploaded, generated, saved or sent, and the page labels its examples as such.

## Run it

```bash
npm install
npm run dev        # http://localhost:3100
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

Built with Next.js 16, React 19 and Motion. It respects `prefers-reduced-motion` and works by keyboard.

## Layout

- `src/demo/DemoExperience.tsx` is the entry component; everything it draws lives in `src/demo/`, styled under `.af-demo`.
- `src/app/` is only a host page for running the demo on its own.
- `tests/playwright/` holds the `playwright-cli run-code` scripts used to test it.
- `screenshots/` holds captures from each build checkpoint.
- `DEMO_INTEGRATION_NOTES.md` explains how to mount the demo as a tab in the main app.
