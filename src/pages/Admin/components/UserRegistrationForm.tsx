import { FormEvent, useCallback, useEffect, useState } from "react";
import { FormCheckbox } from "../../../shared/components/FormCheckbox";
import { FormInput } from "../../../shared/components/FormInput";
import FormSelect from "../../../shared/components/FormSelect";
import { animated, useSpring } from "@react-spring/web";
import { axiosInstance } from "../../../untils";
import { useAuthContext } from "../../../context/AuthContext";
import { PopUpMessage } from "../../../shared/components/PopUpMessage";
import axios from "axios";
import { User } from "../../../types";

interface UserToRegister {
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  phoneNumber: string;
  position: string;
  isSuperAdmin?: boolean;
  departmentId?: number;
  isAdmin: boolean;
}

interface MessageType {
  text: string;
  type: "success" | "warning" | "error";
}

interface RegistrationErrors {
  errorTypes: string[];
  errorMessages: string[];
}

const initialUserData = {
  firstName: "",
  lastName: "",
  patronymic: "",
  email: "",
  phoneNumber: "+380",
  position: "",
  isSuperAdmin: false,
  departmentId: 2,
  isAdmin: false,
};

export const UserRegistrationForm = () => {
  const { user } = useAuthContext(); // current logged in user data

  const [userData, setUserData] = useState<UserToRegister>(initialUserData);
  const [departmentList, setDepartmentList] = useState([]);

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [errors, setErrors] = useState<RegistrationErrors | null>(null);

  const springs = useSpring({
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  });

  const getDepartmentList = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/departments/get-all");
      const departmentList = response.data.departments;
  
      if (departmentList) {
        return departmentList.map((item: any) => ({
          value: item.id.toString(),
          text: item.name,
        }));
      } else {
        console.error("Error fetching department list");
        return null;
      }
    } catch (error:any) {
      console.error("Error fetching department list:", error.message);
      return null;
    }
  }, []);
  

  useEffect(() => {
    getDepartmentList().then((result) => {
      setDepartmentList(result.filter((i: any) => i.value != 1));
    });
  }, []);

  const showMessage = (msg: MessageType) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 2500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      setIsPending(true);
      const response = await axiosInstance.post("/users/register", userData);
  
      if (response.status === 201) {
        console.log("Registration successful");
        showMessage({ text: "Користувача зареєстровано", type: "success" });
        setErrors(null);
        setUserData(initialUserData);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errResponse = error.response;
        console.log(`Registration error (${errResponse?.status}):`, errResponse?.data);
        setErrors(errResponse?.data as RegistrationErrors);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    } finally {
      setIsPending(false);
    }
  };
  

  return (
    <animated.div
      className={`admin-page-wrapper ${isPending && "is-pending"}`}
      style={{ ...springs }}
    >
      <h1 className="admin-header">Реєстрація користувача</h1>
      <div className="form-container">
        <div className={`tab-container ${userData.isAdmin && "reg-admin"}`}>
          <span
            onClick={() => {
              setUserData({ ...userData, isAdmin: false });
            }}
          >
            Працівник відділу
          </span>
          <span
            onClick={() => {
              setUserData({ ...userData, isAdmin: true });
            }}
          >
            Адміністратор
          </span>
        </div>
        <form className="registration-form" onSubmit={handleSubmit}>
          <FormInput
            type="text"
            id="last-name"
            name="last-name"
            label="Прізвище"
            value={userData.lastName}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className={
              errors && errors.errorTypes?.includes("lastName") ? "invalid" : ""
            }
            required
          />

          <FormInput
            type="text"
            id="first-name"
            name="first-name"
            label="Ім'я"
            value={userData.firstName}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className={
              errors && errors.errorTypes?.includes("firstName") ? "invalid" : ""
            }
            required
          />

          <FormInput
            type="text"
            id="patronymic"
            name="patronymic"
            label="По-батькові"
            value={userData.patronymic}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, patronymic: e.target.value }))
            }
            className={
              errors && errors.errorTypes?.includes("patronymic")
                ? "invalid"
                : ""
            }
            required
          />

          <FormInput
            type="phone-number"
            id="phone-number"
            name="phone-number"
            label="Номер телефону"
            value={userData.phoneNumber}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                phoneNumber: e.target.value.replace(/[-_]/g, ""),
              }))
            }
            className={
              errors && errors.errorTypes?.includes("phoneNumber")
                ? "invalid"
                : ""
            }
            required
          />

          <FormInput
            type="text"
            id="email"
            name="email"
            label="Адреса ел.пошти"
            value={userData.email}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={
              errors && errors.errorTypes?.includes("email") ? "invalid" : ""
            }
            required
          />

          <FormInput
            type="text"
            id="position"
            name="position"
            label="Посада"
            value={userData.position}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, position: e.target.value }))
            }
            className={
              errors && errors.errorTypes?.includes("position") ? "invalid" : ""
            }
            required
          />

          {!userData.isAdmin && (
            <FormSelect
              id="department"
              name="department"
              label="Відділ"
              optionList={departmentList}
              value={userData.departmentId}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  departmentId: Number(e.target.value),
                }))
              }
              className={
                errors && errors.errorTypes?.includes("department")
                  ? "invalid"
                  : ""
              }
              required
            />
          )}

          {userData.isAdmin && (user as User).isSuperAdmin && (
            <FormCheckbox
              id="isSuperAdmin"
              name="isSuperAdmin"
              label="Дозволити додавати інших адміністраторів"
              checked={userData.isSuperAdmin}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  isSuperAdmin: e.target.checked,
                }))
              }
            />
          )}

          {errors && (
            <div className="error-msg-container">
              {errors?.errorMessages.map((m) => (
                <span className="error-message">{m}</span>
              ))}
            </div>
          )}

          <button type="submit" className="admin-btn">
            Зареєструвати
          </button>
        </form>
      </div>

      {message && <PopUpMessage text={message.text} type={message.type} />}
    </animated.div>
  );
};
