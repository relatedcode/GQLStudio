import { useQuery, useSubscription } from "@apollo/client";
import { PROJECTS } from "graphql/queries";
import { PROJECT } from "graphql/subscriptions";
import useAuth from "hooks/useAuth";
import { createContext, useEffect, useState } from "react";
import { sortAsc } from "utils/sort";

const ProjectsContext = createContext({
  projects: [],
  loading: true,
});

export function ProjectsProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  const { data, loading } = useQuery(PROJECTS, {
    variables: {
      ownerId: user?.uid,
    },
    skip: !user,
  });
  const { data: dataPush } = useSubscription(PROJECT, {
    variables: {
      ownerId: user?.uid,
    },
    skip: !user,
  });

  useEffect(() => {
    if (data) setProjects(data.projects);
  }, [data]);

  useEffect(() => {
    if (dataPush) {
      setProjects([
        ...projects.filter(
          (item) => item.objectId !== dataPush.project.objectId
        ),
        dataPush.project,
      ]);
    }
  }, [dataPush]);

  return (
    <ProjectsContext.Provider
      value={{
        projects: projects.filter((item) => !item.isDeleted).sort(sortAsc),
        loading,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export default ProjectsContext;
