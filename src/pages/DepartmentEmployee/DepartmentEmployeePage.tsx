import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessengerProvider } from "../../context/MessengerContext";
import { ProjectProvider } from "../../context/ProjectsContext";
import "../../css/chat.css";
import "../../css/common-interface.css";
import "../../css/project.css";
import { ChatBar } from "./chats/ChatBar";
import { NavPanel } from "./components/NavPanel";
import ProjectsBar from "./projects/ProjectsBar";

type appSection = "chats" | "projects";

export const DepartmentEmployeePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathStart = location.pathname.split("/").filter((p) => p !== "")[0];

  const pageSidebars = {
    chats: <ChatBar />,
    projects: <ProjectsBar />,
  };

  useEffect(() => {
    if (!Object.keys(pageSidebars).includes(pathStart)) navigate(-1);
  }, []);

  return (
    <MessengerProvider>
      <ProjectProvider>
        <div className="left-panel">
          <NavPanel />
          <div className="sidebar">{pageSidebars[pathStart as appSection]}</div>
        </div>
        <div className="right-panel">
          <Outlet />
        </div>
      </ProjectProvider>
    </MessengerProvider>
  );
};
