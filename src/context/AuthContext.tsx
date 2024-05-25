import { AxiosError } from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { loginUser, logoutUser } from "../services/authService";
import { LoadingSpinner } from "../shared/components/LoadingSpinner";
import { User } from "../types";
import { BASE_URL, axiosInstance } from "../untils";

interface AuthContextProps {
  user: User | "unfetched" | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  handleUnauthorized: (err: any) => void;
  socket: Socket | null;
}
export const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | "unfetched" | null>("unfetched");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isServerError, setIsServerError] = useState(false);
  const navigate = useNavigate();

  const { isLoading: isUserLoading, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: () => axiosInstance.get("/users/get-me"),
    onSuccess(res) {
      console.log("user data fetched:", res.data.user);
      setUser(res.data.user);
    },
    onError(err: AxiosError) {
      console.log("User error:", err.response);
      if (err.response?.status === 401) setUser(null);
      else setIsServerError(true);
    },
    retry: false,
    enabled: user === "unfetched",
  });

  const login = async (username: string, password: string) => {
    const u = await loginUser(username, password);

    setUser(u);

    return u !== null;
  };

  const logout = async () => {
    const success = await logoutUser();

    if (success) {
      socket?.disconnect();

      setUser(null);
      navigate("/login");
      console.log("user logged out");
    }
  };

  const handleUnauthorized = (err: any) => {
    if (err.response?.status === 401) {
      console.log("unauthorized");
      setUser(null);
    }
  };

  useEffect(() => {
    if (user && user !== "unfetched") {
      const sckt = io(BASE_URL, {
        withCredentials: true,
        reconnectionDelay: 3000,
      });

      setSocket(sckt);

      sckt?.on("connect", () => {
        console.log("socket-server connected");
      });

      sckt?.on("the session has expired", async () => {
        console.log("The session has expired. Logging out");
        await logout();
      });

      sckt?.on("disconnect", () => {
        console.log("disconnected from socket-server");
      });

      sckt?.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err.message);
        alert("SocketIO server couldn't connect");
      });

      return () => {
        sckt?.disconnect();
      };
    }
  }, [(user as User)?.id]);

  useEffect(() => {
    socket?.on("personal-data-changed", (data) => {
      setUser((prev) => ({
        ...(prev as User),
        username: data.username || (prev as User).username,
        phoneNumber: data.phoneNumber || (prev as User).phoneNumber,
        email: data.email || (prev as User).email,
      }));
      console.log("personal data changed");
    });

    return () => {
      socket?.off("personal-data-changed");
    };
  }, [socket]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, handleUnauthorized, socket }}
    >
      {user !== "unfetched" ? (
        children
      ) : (
        <center
          style={{ margin: "auto auto", fontSize: "1.5em", color: "#aaa" }}
        >
          {!isServerError &&
            user === "unfetched" &&
            "Перевірка входу користувача"}
          {isServerError && (
            <>
              При отриманні даних користувача сталась помилка
              <div
                className="reload-btn"
                onClick={() => {
                  setIsServerError(false);
                  refetch();
                }}
              >
                Перезавантажити
              </div>
            </>
          )}

          {isUserLoading && <LoadingSpinner />}
        </center>
      )}
    </AuthContext.Provider>
  );
};
