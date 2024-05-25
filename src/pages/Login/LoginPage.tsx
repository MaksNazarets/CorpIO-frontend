import { FormInput } from "../../shared/components/FormInput";
import "../../css/login-page.css";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthContext();

  const [isAuthError, setIsAuthError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setIsPending(true);
    const success = await login(username, password);
    setIsPending(false);

    if (success) navigate("/", { replace: true });
    else {
      setIsAuthError(true);
      setTimeout(() => {
        setIsAuthError(false);
      }, 700);
    }
  };

  useEffect(() => {
    document.title = "Вхід в систему";
  }, []);

  return (
    <div
      className={`login-form-container ${isAuthError && "auth-error"}  ${
        isPending && "is-pending"
      }`}
    >
      <div className="form-header">
        <h1>Вхід у систему</h1>
      </div>
      <form className="login-form" onSubmit={handleLogin}>
        <FormInput
          type="text"
          id="username"
          name="username"
          label="Ім'я користувача"
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
          required
        />
        <FormInput
          type="password"
          id="password"
          name="password"
          label="Пароль"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Увійти</button>
        <a className="form-link" href="#">
          Забули пароль?
        </a>
      </form>
    </div>
  );
};
