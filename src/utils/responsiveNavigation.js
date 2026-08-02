const PRIMARY_NAVIGATION = [
  { id: "home", label: "Home" },
  { id: "course", label: "Course" },
  { id: "scam-checker", label: "Scam Checker" },
  { id: "badges", label: "Badges" },
  { id: "settings", label: "Settings" },
];

const ACTIVE_DESTINATION_BY_SCREEN = {
  home: "home",
  path: "course",
  "scam-checker": "scam-checker",
  badges: "badges",
  settings: "settings",
};

export function primaryNavigationState(screen, isAuthenticated) {
  const activeDestination = ACTIVE_DESTINATION_BY_SCREEN[screen];
  if (!isAuthenticated || !activeDestination) return [];

  return PRIMARY_NAVIGATION.map((item) => ({
    ...item,
    active: item.id === activeDestination,
  }));
}
