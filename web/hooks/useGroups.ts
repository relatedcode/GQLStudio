import { useContext } from 'react';
import GroupsContext from 'contexts/GroupsContext';

const useGroups = () => useContext(GroupsContext);

export default useGroups;
