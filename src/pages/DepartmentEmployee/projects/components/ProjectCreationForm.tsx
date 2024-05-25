import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { FormInput } from "../../../../shared/components/FormInput";
import { FormTextArea } from "../../../../shared/components/FormTextArea";
import { User } from "../../../../types";
import {
  BASE_API_URL,
  axiosInstance,
  formatBytes,
  getFilenameParts,
} from "../../../../untils";
import { useAuthContext } from "../../../../context/AuthContext";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner";
import { useModalWindowsContext } from "../../../../context/ModalWindowsContext";
import FormSelect from "../../../../shared/components/FormSelect";
import { FormCheckbox } from "../../../../shared/components/FormCheckbox";

type ProjectData = {
  name: string;
  description: string;
  attachments: FileList | null;
  projectMembersIds: number[];
  projectManagerId?: number;
  createProjectGroup: boolean;
  isDepartmentProject: boolean;
};

type CreationErrors = {
  errorTypes: string[];
  errorMessages: string[];
};

const ProjectAttachment = ({ file }: { file: File }) => {
  return (
    <div className="project-attachment" key={file.name}>
      <div className="project-attachment__name">
        <span className="filename">{getFilenameParts(file.name).name}</span>.
        <span>{getFilenameParts(file.name).extension}</span>
      </div>
      <div className="project-attachment__size">{formatBytes(file.size)}</div>
    </div>
  );
};

const ProjectCreationForm = () => {
  const { user } = useAuthContext();
  const { setProfileViewerUserId } = useModalWindowsContext();

  const [newProjectData, setNewProjectData] = useState<ProjectData>({
    name: "",
    description: "",
    attachments: null,
    projectMembersIds: [],
    projectManagerId: undefined,
    createProjectGroup: false,
    isDepartmentProject: false,
  });
  const attachmentsInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<CreationErrors | null>(null);

  const nav = useNavigate();

  const { mutate: createProject, isLoading: isCreatingProject } = useMutation({
    mutationKey: ["create-project"],
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", newProjectData.name);
      formData.append("description", newProjectData.description);
      formData.append(
        "projectMembersIds",
        JSON.stringify(newProjectData.projectMembersIds)
      );
      if (newProjectData.projectManagerId)
        formData.append(
          "projectManagerId",
          newProjectData.projectManagerId.toString()
        );
      formData.append(
        "createProjectGroup",
        JSON.stringify(newProjectData.createProjectGroup)
      );

      formData.append(
        "isDepartmentProject",
        JSON.stringify(newProjectData.isDepartmentProject)
      );

      for (let file of newProjectData.attachments || []) {
        formData.append("attachments", file);
      }

      return axiosInstance.post("/projects/create-project", formData);
    },
    onSuccess(res) {
      const projectId = res.data?.projectId;

      nav("/projects/" + projectId);
      console.log(`Project (id: ${projectId}) successfully created`);
    },

    onError(err: any) {
      console.error("Error while creating the project:", err.response.data);
      if (err.response.status === 400) {
        setErrors(err.response.data);
      }

      alert("При створенні проєкту сталась невідома помилка");
    },
  });

  const { data: departmentEmployeesRes, isLoading: isUsersLoading } = useQuery({
    queryKey: ["get-project-users"],
    queryFn: () =>
      axiosInstance.get(
        "/users/get-users?depId=" + (user as User).department?.id
      ),

    onError(err: any) {
      console.error(
        "error while receiving department employees list:",
        err.response
      );
    },

    retry(failureCount) {
      if (failureCount > 2) return false;
      return true;
    },
  });

  const isUserSelected = (userId: number) => {
    return newProjectData.projectMembersIds.some((mid) => mid === userId);
  };

  const getUserById = (uid: number) =>
    departmentEmployeesRes?.data.users.find((u: User) => u.id === uid);

  const submit = (e: any) => {
    e.preventDefault();
    createProject();
  };

  useEffect(() => {
    if (
      newProjectData.projectManagerId &&
      newProjectData.projectMembersIds.length === 0 &&
      !newProjectData.projectMembersIds.includes(
        newProjectData.projectManagerId
      )
    ) {
      setNewProjectData((prev) => ({
        ...prev,
        projectManagerId: undefined,
      }));
    } else if (newProjectData.projectMembersIds.length === 1) {
      setNewProjectData((prev) => ({
        ...prev,
        projectManagerId: newProjectData.projectMembersIds[0],
      }));
    }
  }, [newProjectData.projectMembersIds]);

  return (
    <div className="project-creation-form-wrapper">
      <h1>Створення проєкту</h1>
      <form onSubmit={submit}>
        <FormInput
          id="project-name-input"
          name="project-name"
          label="Назва проекту"
          value={newProjectData.name}
          onChange={(e) =>
            setNewProjectData((prev) => ({ ...prev, name: e.target.value }))
          }
          className={
            errors && errors.errorTypes?.includes("project-name")
              ? "invalid"
              : ""
          }
          required
        />

        <FormTextArea
          id="project-description-input"
          name="description"
          label="Опис"
          value={newProjectData.description}
          onChange={(e) =>
            setNewProjectData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={5}
          style={{ fontSize: "1.5em", paddingTop: "1.5em" }}
        />

        {errors && (
          <div className="error-msg-container">
            {errors?.errorMessages?.map((m) => (
              <span className="error-message" key={m}>
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="project-attachment-list">
          <span>
            {newProjectData.attachments && newProjectData.attachments.length > 0
              ? "Прикріплені файли"
              : "Файлів не прикріплено"}
          </span>
          {Array.from(newProjectData.attachments || []).map((a) => (
            <ProjectAttachment file={a} />
          ))}
        </div>
        <label htmlFor="project-attachments-file-input">
          {newProjectData.attachments && newProjectData.attachments.length > 0
            ? "Змінити файли"
            : "Прикріпити файли"}
        </label>
        <input
          ref={attachmentsInputRef}
          type="file"
          id="project-attachments-file-input"
          onChange={(e) =>
            setNewProjectData((prev) => ({
              ...prev,
              attachments: e.target.files,
            }))
          }
          multiple
        />

        <div className="project-user-selector">
          <span className="project-team-header">Створіть команду проєкту</span>

          <div className="project-users-list">
            {isUsersLoading ? (
              <LoadingSpinner />
            ) : (
              departmentEmployeesRes?.data.users.map((e: User) => (
                <div
                  className={`project-user ${
                    isUserSelected(e.id) ? "selected" : ""
                  }`}
                  key={e.id}
                >
                  <div
                    className="project-user-avatar"
                    onClick={() => setProfileViewerUserId(e.id)}
                    style={{
                      backgroundImage: `url('${BASE_API_URL}/users/${e.id}/avatar')`,
                    }}
                  ></div>
                  <div className="project-user-info">
                    <div
                      className="project-user-name"
                      onClick={() => setProfileViewerUserId(e.id)}
                    >
                      {e.lastName} {e.firstName} {e.patronymic ?? e.patronymic}
                    </div>
                    <div className="project-user-position">{e.position}</div>
                  </div>
                  <div className="project-user-checkmark">
                    <div
                      onClick={() =>
                        isUserSelected(e.id)
                          ? setNewProjectData((prev) => ({
                              ...prev,
                              projectMembersIds: prev.projectMembersIds.filter(
                                (mid) => mid !== e.id
                              ),
                            }))
                          : setNewProjectData((prev) => ({
                              ...prev,
                              projectMembersIds: [
                                ...prev.projectMembersIds,
                                e.id,
                              ],
                            }))
                      }
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <FormSelect
            label="Керівник проєкту"
            optionList={newProjectData.projectMembersIds.map((mid) => ({
              value: mid.toString(),
              text: `${getUserById(mid).lastName} ${
                getUserById(mid).firstName
              } ${getUserById(mid).patronymi || ""}`,
            }))}
            value={newProjectData.projectManagerId?.toString()}
            onChange={(e) =>
              setNewProjectData((prev) => ({
                ...prev,
                projectManagerId: Number(e.target.value) || undefined,
              }))
            }
            required
          />
        </div>

        <FormCheckbox
          id="is-department-project"
          name="is-department-project"
          label={`Проєкт виключно відділу "${(user as User).department?.name}"`}
          checked={newProjectData.isDepartmentProject}
          onChange={() =>
            setNewProjectData((prev) => ({
              ...prev,
              isDepartmentProject: !prev.isDepartmentProject,
            }))
          }
        />

        <FormCheckbox
          id="create-project-group"
          name="create-project-group"
          label="Створити груповий чат проєкту"
          checked={newProjectData.createProjectGroup}
          onChange={() =>
            setNewProjectData((prev) => ({
              ...prev,
              createProjectGroup: !prev.createProjectGroup,
            }))
          }
        />

        {isCreatingProject ? (
          <LoadingSpinner />
        ) : (
          <button type="submit" className="big-button submit-btn">
            Створити
          </button>
        )}
      </form>
    </div>
  );
};
export default ProjectCreationForm;
