import {
  BookIcon,
  HomeIcon,
  MessageSearchIcon,
  SettingsIcon,
  ShieldIcon,
} from "./Icons";
import { primaryNavigationState } from "../utils/responsiveNavigation.js";
import TextSizeControl from "./TextSizeControl";

const iconByDestination = {
  home: HomeIcon,
  course: BookIcon,
  "scam-checker": MessageSearchIcon,
  badges: ShieldIcon,
  settings: SettingsIcon,
};

export default function AppShell({
  children,
  screen = "loading",
  isAuthenticated = false,
  onHome,
  onCourse,
  onScamChecker,
  onBadges,
  onSettings,
  textSize,
  onTextSizeChange,
}) {
  const navigation = primaryNavigationState(screen, isAuthenticated);
  const handlers = {
    home: onHome,
    course: onCourse,
    "scam-checker": onScamChecker,
    badges: onBadges,
    settings: onSettings,
  };
  const showNavigation = navigation.length > 0;

  return (
    <div className={`app-viewport app-screen-${screen}`}>
      <div
        className={`app-shell ${
          showNavigation ? "has-app-navigation" : "is-focus-shell"
        }`}
      >
        {showNavigation ? (
          <nav className="app-navigation" aria-label="Primary navigation">
            <div className="app-navigation-brand">
              <img
                src="/everwise-logo-192.png"
                alt=""
                aria-hidden="true"
                className="app-navigation-logo"
              />
              <span>Everwise</span>
            </div>
            <div className="app-navigation-items">
              {navigation.map((item) => {
                const Icon = iconByDestination[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handlers[item.id]}
                    aria-current={item.active ? "page" : undefined}
                    className={`app-navigation-item ${
                      item.active ? "is-active" : ""
                    }`}
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Text size sits directly under the nav links — in the reading
                  path, not tucked into a corner — so it is reachable from
                  every screen, not just Home. */}
              {onTextSizeChange ? (
                <div className="app-navigation-textsize">
                  <span className="app-navigation-textsize-label">
                    Text size
                  </span>
                  <TextSizeControl
                    textSize={textSize}
                    onTextSizeChange={onTextSizeChange}
                    buttonClassName="app-navigation-textsize-button"
                  />
                </div>
              ) : null}
            </div>
          </nav>
        ) : null}

        <main className={`app-canvas app-canvas-${screen}`}>{children}</main>
      </div>
    </div>
  );
}
