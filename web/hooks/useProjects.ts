import { useContext } from 'react';
import ProjectsContext from 'contexts/ProjectsContext';

const useProjects = () => useContext(ProjectsContext);

export default useProjects;
