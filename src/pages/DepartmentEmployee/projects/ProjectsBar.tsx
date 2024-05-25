import { useEffect, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { SearchInput } from "../components/SearchInput";
import { PlusIcon } from "../../../assets/icon_components/PlusIcon";
import { Link } from "react-router-dom";
import { User } from "../../../types";
import { useQuery } from "react-query";
import { axiosInstance } from "../../../untils";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useProjectsContext } from "../../../context/ProjectsContext";

type Props = {};

function ProjectsBar({}: Props) {
  const { user } = useAuthContext();

  const {
    projectListType,
    setProjectListType,
    myProjects,
    setMyProjects,
    allProjects: depatmentProjects,
    setAllProjects,
  } = useProjectsContext();

  const [projectsFilter, setProjectsFilter] = useState("");

  const { isLoading: isMyProjectsLoading, refetch: loadMyProjects } = useQuery({
    queryKey: ["get-my-projects"],
    queryFn: () => axiosInstance.get("projects/get-my-projects"),
    onSuccess: (res) => {
      console.log("Successfully loaded my projects:", res.data.projects);
      setMyProjects(res.data.projects);
    },
    onError: (err) => {
      console.error("Error while loading projects:", err);
    },
    enabled: false,
  });

  const { isLoading: isAllProjectsLoading, refetch: loaAllProjects } = useQuery(
    {
      queryKey: ["get-all-projects"],
      queryFn: () => axiosInstance.get("projects/get-all-projects"),
      onSuccess: (res) => {
        console.log("Successfully loaded all projects:", res.data.projects);
        setAllProjects(res.data.projects);
      },
      onError: (err) => {
        console.error("Error while loading projects:", err);
      },
      enabled: false,
    }
  );

  useEffect(() => {
    if (myProjects === null && projectListType === "my") loadMyProjects();
    else if (depatmentProjects === null && projectListType == "all")
      loaAllProjects();
  }, [projectListType]);

  useEffect(() => {
    const prevTitle = document.title;

    document.title = "Проекти - CorpIO";

    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <>
      <div className="bar-top">
        <SearchInput
          value={projectsFilter}
          onChange={(e) => setProjectsFilter(e.target.value)}
          placeholder="Введіть назву проєкту..."
        />
        {(user as User).isHeadOfDepartment && (
          <Link className="plus-btn" to={"/projects/new-project"}>
            <PlusIcon />
          </Link>
        )}
      </div>
      <div className="chat-type-tab-container">
        <button
          className={projectListType === "my" ? "active" : ""}
          onClick={() => setProjectListType("my")}
        >
          Мої
        </button>
        <button
          className={projectListType === "all" ? "active" : ""}
          onClick={() => setProjectListType("all")}
        >
          Всі
        </button>
      </div>
      <div className="projects-list">
        {projectListType === "my" && isMyProjectsLoading && (
          <LoadingSpinner top />
        )}
        {projectListType === "all" && isAllProjectsLoading && (
          <LoadingSpinner top />
        )}
        {(projectListType === "my" ? myProjects : depatmentProjects)
          ?.filter((p) => new RegExp(projectsFilter, "i").test(p.name))
          .map((p) => (
            <Link to={"/projects/" + p.id} key={p.id}>
              <div className="projects-item">{p.name}</div>
            </Link>
          ))}
        {(projectListType === "my" ? myProjects : depatmentProjects)?.length ===
          0 && (
          <span className="no-list-items-label">Проєктів не знайдено...</span>
        )}
      </div>
    </>
  );
}

export default ProjectsBar;
