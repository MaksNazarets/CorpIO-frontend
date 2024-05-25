import { useAuthContext } from "../../context/AuthContext";
import "../../css/admin.css";
// import "../../css/chat.css";
import { Link, Outlet } from "react-router-dom";
import { SubbuttonContainer } from "./components/SubbuttonContainer";
import { User } from "../../types";

export const AdminPage = () => {
  const { logout, user } = useAuthContext();

  return (
    <>
      <div className="left-panel">
        <div className="sidebar">
          <h1 className="admin-header">
            {(user as User)?.firstName} {(user as User)?.lastName}
          </h1>
          <div className="admin-btns-container">
            <Link to="/user-registration" className="admin-btn">
              Реєстрація користувача
            </Link>
            <Link to="/user-registration" className="admin-btn">
              Керування користувачами{" "}
            </Link>
            <SubbuttonContainer
              parentButton={
                <span className="admin-btn">Керування відділами</span>
              }
            >
              <Link to="/department-registration" className="admin-btn subbtn">
                Додавання відділу
              </Link>
              <Link to="/department-management" className="admin-btn subbtn">
                Зміна відділів
              </Link>
            </SubbuttonContainer>
            <Link to="/statistics" className="admin-btn">
              Статистика
            </Link>
          </div>
          <button
            className="admin-btn admin-logout-btn"
            onClick={() => logout()}
          >
            Вийти з облікового запису
          </button>
        </div>
      </div>
      <div className="right-panel">
        <Outlet />
      </div>
    </>
  );
};
