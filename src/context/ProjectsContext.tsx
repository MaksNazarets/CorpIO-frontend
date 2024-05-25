import { ReactNode, createContext, useContext, useState } from "react";

type ProjectItem = {
  id: number;
  name: string;
};

interface ProjectsContextProps {
  projectListType: "my" | "all";
  setProjectListType: React.Dispatch<React.SetStateAction<"my" | "all">>;
  myProjects: ProjectItem[] | null;
  setMyProjects: React.Dispatch<React.SetStateAction<ProjectItem[] | null>>;
  allProjects: ProjectItem[] | null;
  setAllProjects: React.Dispatch<React.SetStateAction<ProjectItem[] | null>>;
}

export const ProjectsContext = createContext<ProjectsContextProps | null>(null);

export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjectsContext must be used within a ProjectProvider");
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projectListType, setProjectListType] = useState<"my" | "all">("my");
  const [myProjects, setMyProjects] = useState<ProjectItem[] | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectItem[] | null>(null);

  return (
    <ProjectsContext.Provider
      value={{
        projectListType,
        setProjectListType,
        myProjects,
        setMyProjects,
        allProjects,
        setAllProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};
