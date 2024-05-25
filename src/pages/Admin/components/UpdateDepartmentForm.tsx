import { animated, useSpring } from "@react-spring/web";
import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormInput } from "../../../shared/components/FormInput";
import FormSelect from "../../../shared/components/FormSelect";
import { PopUpMessage } from "../../../shared/components/PopUpMessage";
import { MessageType, User } from "../../../types";
import { axiosInstance } from "../../../untils";
import { DeleteBtn } from "./DeleteBtn";

type DepartmentToUpdate = {
  name: string;
  headUserId: number | undefined;
};

type UpdateErrors = {
  errorTypes: string[];
  errorMessages: string[];
};

type DepartmentUser = {
  value: string;
  text: string;
};

const initialDepartmentData: DepartmentToUpdate = {
  name: "",
  headUserId: undefined,
};

export const UpdateDepartmentForm = () => {
  const { departmentId } = useParams();

  const springs = useSpring({
    from: { transform: "translateY(20px)" },
    to: { transform: "translateY(0)" },
  });

  const [departmentData, setDepartmentData] = useState<DepartmentToUpdate>(
    initialDepartmentData
  );
  const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);

  const [serviceMessage, setServiceMessage] = useState<MessageType | null>(
    null
  );
  const [errors, setErrors] = useState<UpdateErrors | null>(null);

  const { isLoading: isDepDataLoading } = useQuery({
    queryKey: ["department", [departmentId]],
    queryFn: () =>
      axiosInstance.get(
        `/departments/get-department?depId=${departmentId}&withHead=true`
      ),

    onError(err: any) {
      err.data ? console.log(err.data) : console.log(err);
    },

    onSuccess(res) {
      console.log(res.data);
      const dep = res.data.department;
      setDepartmentData({
        name: dep.name,
        headUserId: dep.head?.id || Number(departmentUsers[0]?.value),
      });
    },
  });

  const { isLoading: isUsersLoading } = useQuery({
    queryKey: ["user", [departmentId]],
    queryFn: () => axiosInstance.get(`/users/get-users?depId=${departmentId}`),

    onError(err) {
      console.log(err);
    },

    onSuccess(res) {
      console.log(res.data);
      setDepartmentUsers(
        res.data.users?.map((user: User) => ({
          value: user.id.toString(),
          text: `${user.lastName} ${user.firstName}${
            user.patronymic ? " " + user.patronymic : ""
          }`,
        }))
      );

      if (!departmentData.headUserId) {
        console.log("no dep head", res.data.users[0]?.id);
        setDepartmentData((curr) => ({
          ...curr,
          headUserId: res.data.users[0]?.id,
        }));
      }
    },
  });

  const { mutateAsync: updateDepartment, isLoading: isUpdating } = useMutation({
    mutationFn: () =>
      axiosInstance.put("/departments/update/" + departmentId, {
        id: Number(departmentId),
        name: departmentData.name,
        headId: departmentData.headUserId,
      }),
    onSuccess() {
      showMessage({
        text: "Дані відділу успішно змінено",
        type: "success",
      });
      navigate(-1);
    },
    onError(err: any) {
      console.error(err);
      setErrors(err.response.data);
    },
  });

  const { mutateAsync: deleteDepartment, isLoading: isDeleting } = useMutation({
    mutationFn: () =>
      axiosInstance.delete("/departments/delete/" + Number(departmentId)),
    onSuccess() {
      showMessage({
        text: "Відділ видалено",
        type: "success",
      });
      navigate(-1);
      console.log("Department removed");
    },
    onError(err: any) {
      console.error(err);
      setErrors(err.response.data);
    },
  });

  const navigate = useNavigate();

  const showMessage = (msg: MessageType) => {
    setServiceMessage(msg);
    setTimeout(() => {
      setServiceMessage(null);
    }, 2500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    updateDepartment();
  };

  return (
    <animated.div
      className={`admin-page-wrapper ${
        (isUsersLoading || isDepDataLoading || isUpdating || isDeleting) &&
        "is-pending"
      }`}
      style={{ maxWidth: "700px", width: "100%", ...springs }}
    >
      <h1 className="admin-header">Редагування відділу</h1>
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

          <FormSelect
            id="project-manager"
            name="departmentHead"
            label="Голова відділу"
            optionList={departmentUsers}
            value={
              departmentData.headUserId?.toString() || departmentUsers[0]?.value
            }
            onChange={(e) =>
              setDepartmentData((prev) => ({
                ...prev,
                headUserId: Number(e.target.value),
              }))
            }
            className={
              errors && errors.errorTypes?.includes("department")
                ? "invalid"
                : ""
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

          <div className="btn-container-horizontal">
            <button type="submit" className="admin-btn save-changes-btn">
              Зберегти зміни
            </button>
            <DeleteBtn onClick={() => deleteDepartment()} />
          </div>
          <Link
            to="#"
            className="admin-btn small secondary"
            onClick={() => navigate(-1)}
            style={{ textAlign: "center" }}
          >
            Скасувати
          </Link>
        </form>
      </div>

      {serviceMessage && (
        <PopUpMessage text={serviceMessage.text} type={serviceMessage.type} />
      )}
    </animated.div>
  );
};
