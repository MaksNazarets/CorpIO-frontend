import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChatsIcon } from "../../../assets/icon_components/ChatsIcon";
import { LogoutIcon } from "../../../assets/icon_components/LogoutIcon";
import { PlannerIcon } from "../../../assets/icon_components/PlannerIcon";
import { useAuthContext } from "../../../context/AuthContext";
import { User } from "../../../types";
import SettingsPanel from "../chats/components/SettingsPanel";

export const NavPanel = () => {
  const { logout } = useAuthContext();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuthContext();

  const pathStart = location.pathname.split("/").filter((p) => p !== "")[0];

  return (
    <nav className={isOpen ? "open" : ""}>
      {isSettingsOpen ? (
        <SettingsPanel closeFn={() => setIsSettingsOpen(false)} />
      ) : (
        <>
          <div className="navbar-top">
            <div
              className="burger-icon"
              onClick={() => setIsOpen((curr) => !curr)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div
              className="profile-info"
              onClick={() => setIsSettingsOpen(true)}
            >
              {(user as User).firstName} {(user as User).lastName}
            </div>
          </div>
          <ul>
            <li
              className={`nav-menu-item ${
                pathStart === "chats" ? "active" : ""
              }`}
            >
              <Link to={"/chats"}>
                <ChatsIcon />
                <span>Чати</span>
              </Link>
            </li>
            <li
              className={`nav-menu-item ${
                pathStart === "projects" ? "active" : ""
              }`}
            >
              <Link to={"/projects"}>
                <PlannerIcon />
                <span>Проекти</span>
              </Link>
            </li>
          </ul>
          <div className="nav-menu-item logout-btn" onClick={() => logout()}>
            <div>
              <LogoutIcon />
              <span>Вийти</span>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
