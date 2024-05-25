import { animated, useSpring } from "@react-spring/web";
import axios from "axios";
import { FormEvent, useState } from "react";
import { FormInput } from "../../../shared/components/FormInput";
import { PopUpMessage } from "../../../shared/components/PopUpMessage";
import { axiosInstance } from "../../../untils";
import { MessageType } from "../../../types";

interface DepartmentToCreate {
  name: string;
  headUserId: number | undefined;
}

interface CreationErrors {
  errorTypes: string[];
  errorMessages: string[];
}

const initialDepartmentData: DepartmentToCreate = {
  name: "",
  headUserId: undefined,
};

export const DepartmentCreationForm = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentToCreate>(
    initialDepartmentData
  );
  // const [userList, setUserList] = useState([]);

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [errors, setErrors] = useState<CreationErrors | null>(null);

  const springs = useSpring({
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  });

  // const getUserListByStr = useCallback(async (str: string) => {
  //   cancelTokenSource.cancel("Request canceled");

  //   // Create a new cancel token source for the current request
  //   const newCancelTokenSource = axios.CancelToken.source();

  //   // Set the new cancel token for the current request
  //   cancelTokenSource = newCancelTokenSource;

  //   try {
  //     const response = await axiosInstance.get("/users/get?str=" + str, {
  //       params: { str },
  //       cancelToken: newCancelTokenSource.token,
  //     });

  //     const userList = response.data.users;

  //     if (userList) {
  //       setUserList(
  //         userList.map((user: any) => ({
  //           value: user.id.toString(),
  //           text: `${user.lastName} ${user.firstName.charAt(0)}. ${
  //             user.patronymic ? user.patronymic.charAt(0) + "." : ""
  //           }`,
  //         }))
  //       );
  //     } else {
  //       console.error("Error fetching user list");
  //     }
  //   } catch (error: any) {
  //     if (isCancel(error)) {
  //       console.log("Request canceled:", error.message);
  //     } else {
  //       console.error("Error fetching user list:", error.message);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   getUserListByStr().then((result) => {
  //     setDepartmentList(result.filter((i: any) => i.value != 1));
  //   });
  // }, []);

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
      const response = await axiosInstance.post(
        "/departments/create",
        departmentData
      );

      if (response.status === 201) {
        console.log("Creation successful");
        showMessage({ text: "Відділ створено", type: "success" });
        setErrors(null);
        setDepartmentData(initialDepartmentData);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errResponse = error.response;
        console.log(
          `Department creation error (${errResponse?.status}):`,
          errResponse?.data
        );
        setErrors(errResponse?.data as CreationErrors);

        if (error.status !== 400) {
          showMessage({ text: "Сталась невідома помилка", type: "error" });
          setErrors(null);
        }
      } else {
        console.error("Unexpected error during department creation:", error);
        showMessage({ text: "Сталась невідома помилка", type: "error" });
        setErrors(null);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <animated.div
      className={`admin-page-wrapper ${isPending && "is-pending"}`}
      style={{ maxWidth: "700px", width: "100%", ...springs }}
    >
      <h1 className="admin-header">Створення відділу</h1>
      <div className="form-container">
        <form className="registration-form" onSubmit={handleSubmit}>
          <FormInput
            type="text"
            id="department-name"
            name="department-name"
            label="Назва відділу"
            value={departmentData.name}
            onChange={(e) =>
              setDepartmentData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className={
              errors && errors.errorTypes?.includes("name") ? "invalid" : ""
            }
            width="100%"
            required
          />

          {errors && (
            <div className="error-msg-container">
              {errors?.errorMessages?.map((m) => (
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
