// All onboarding tour steps in one place.
// DO NOT hardcode steps into individual pages — edit this file only.
export const TOUR_STEPS = [
  {
    id: "dashboard",
    target: "[data-tour='kpi-cards']",
    title: "Welcome to the IDX Governance Dashboard! 👋",
    content:
      "This is your main dashboard. At a glance you can see a summary of all listed stocks — including how many fall into each risk category.",
    placement: "bottom",
  },
  {
    id: "overview-tab",
    target: "[data-tour='tab-overview']",
    title: "See the Big Picture with Charts",
    content:
      "The Overview tab shows easy-to-read charts about stock risk levels and ownership concentration. It's the best place to start exploring.",
    placement: "bottom",
  },
  {
    id: "screener",
    target: "[data-tour='tab-screener']",
    title: "Browse & Filter Every Stock",
    content:
      "The Screener tab gives you a full, sortable list of all stocks. Use it to find exactly what you're looking for — no technical know-how needed.",
    placement: "bottom",
  },
  {
    id: "search",
    target: "[data-tour='search']",
    title: "Find Any Stock in Seconds",
    content:
      "Type a company name or stock code here to instantly find it. For example, try typing \"BBCA\" or \"Bank Central\".",
    placement: "bottom",
  },
  {
    id: "presets",
    target: "[data-tour='presets']",
    title: "Quick Filters — One Click Away!",
    content:
      "These handy buttons instantly filter stocks by popular categories. Click any preset to jump straight to the stocks you care about most.",
    placement: "bottom",
  },
];
