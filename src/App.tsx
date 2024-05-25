import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { AdminPage } from "./pages/Admin/AdminPage";
import { DepartmentCreationForm } from "./pages/Admin/components/DepartmentCreationForm";
import { DepartmentManagementPanel } from "./pages/Admin/components/DepartmentManagementPanel";
import { UpdateDepartmentForm } from "./pages/Admin/components/UpdateDepartmentForm";
import { UserRegistrationForm } from "./pages/Admin/components/UserRegistrationForm";
import { DepartmentEmployeePage } from "./pages/DepartmentEmployee/DepartmentEmployeePage";
import AddChatWindow from "./pages/DepartmentEmployee/chats/AddChatWindow";
import PrivateChatCreationForm from "./pages/DepartmentEmployee/chats/PrivateChatCreationForm";
import { Chat } from "./pages/DepartmentEmployee/chats/components/Chat";
import { LoginPage } from "./pages/Login/LoginPage";
import { NotAuthenticatedPage } from "./pages/NotAuthenticated.tsx/NotAuthenticatedPage";
import { User } from "./types";
import { Statistics } from "./pages/Admin/components/Statistics";
import ProjectCreationForm from "./pages/DepartmentEmployee/projects/components/ProjectCreationForm";
import ProjectPage from "./pages/DepartmentEmployee/projects/ProjectPage";

function App() {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/login"
        element={user == null ? <LoginPage /> : <Navigate to="/" />}
      />

      {user === null ? (
        <Route path="/" element={<NotAuthenticatedPage />} />
      ) : (user as User).department?.id == 1 ? (
        <Route path="/" element={<AdminPage />}>
          <Route path="/user-registration" element={<UserRegistrationForm />} />
          <Route
            path="/department-registration"
            element={<DepartmentCreationForm />}
          />
          <Route
            path="/department-management"
            element={<DepartmentManagementPanel />}
          />
          <Route
            path="/department-management/:departmentId"
            element={<UpdateDepartmentForm />}
          />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      ) : (
        <Route path="/" element={<DepartmentEmployeePage />}>
          <Route path="/:appSection" element={""} />
          <Route path="/" element={<Navigate to={"/chats"} />} />
          <Route
            path="/chats/add-private"
            element={<PrivateChatCreationForm />}
          />
          <Route
            path="/chats/add-group"
            element={<AddChatWindow chatType="g" />}
          />
          <Route
            path="/chats/add-channel"
            element={<AddChatWindow chatType="c" />}
          />
          <Route
            path="/chats/:chatType/:chatId"
            element={
              <ChatProvider>
                <Chat />
              </ChatProvider>
            }
          />
          <Route
            path="/projects/new-project"
            element={<ProjectCreationForm />}
          />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
