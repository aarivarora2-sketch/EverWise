# Paywall design QA

## Source

- Reference screenshot: `/var/folders/0j/_cxf9qzn0wl1hk47hnx12mrh0000gn/T/codex-clipboard-7ecfb90d-aa7d-4a43-838d-59ab831895d4.png`
- Reference dimensions: 852 × 1845
- Reference state: annual plan selected, full paywall

## Implementation

- Largest-text screenshot: `/tmp/everwise-paywall-exact-size10.png`
- Phone-frame screenshot: `/tmp/everwise-paywall-full-height.png`
- Same-input comparison: `/tmp/everwise-paywall-full-height-comparison.png`
- Browser viewport: 738 × 959
- App frame bounds: 430 × 860
- Tested text states: size 5 of 10 and size 10 of 10

## Comparison history

1. The multi-screen paywall was replaced with the single-screen composition shown in the new reference.
2. The implementation now matches the reference structure: close control, centered EverWise mark and wordmark, serif confidence headline, two icon-led benefit rows, annual and monthly selection cards, savings and trial labels, clay CTA, reassurance, and teal footer actions.
3. Standard icons from Lucide replace the earlier approximate message and lock icons.
4. The reference and final implementation were placed side by side in `/tmp/everwise-paywall-exact-comparison.png`.
5. Visible differences are limited to compression required by the shorter 430 × 860 phone frame and Everwise's existing typography rendering.
6. The paywall uses a fixed, reference-matched type scale so switching between the application's ten text settings does not create a scroll area or clip controls.
7. DOM geometry checks at size 10 found no clipped content, no page scrolling, and no scrollable paywall container.
8. The paywall uses the same 430 × 860 phone frame as every other Everwise screen.
9. Annual billing was updated to $89.99/year, with the equivalent price of $7.50/month and a 50% savings label versus twelve monthly payments. The free trial is seven days.
10. A P1 composition issue was found after the first phone-frame pass: the content was compressed into the upper portion of the screen, leaving too much unused space.
11. The header, benefits, plan cards, CTA, and type scale were enlarged and redistributed vertically. The revised comparison shows the paywall using the full 430 × 860 frame with the same visual rhythm as the reference.
12. Post-fix DOM geometry found zero clipped elements, zero scrollable containers, and a body height equal to the 959px browser viewport.

## Final fidelity check

- Fonts and typography: hierarchy, wrapping, weights, and line heights match the source's intent; the implementation uses Everwise's existing font rendering.
- Spacing and layout rhythm: the content now spans the full phone frame without a large empty middle area.
- Colors and visual tokens: cream, clay, sage, teal, borders, and shadows remain consistent with Everwise and the source.
- Image and icon quality: the supplied Everwise logo and Lucide interface icons render cleanly at the final size.
- Copy and content: structure matches the source; the annual plan is $89.99/year, its displayed monthly equivalent is $7.50, its savings label is 50%, and the trial lasts seven days.
- Focused-region comparison was not needed because all text, controls, icons, and card boundaries are clearly readable in the equal-height side-by-side comparison.

final result: passed
