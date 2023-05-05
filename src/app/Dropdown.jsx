import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export default function NewDropdown() {


  return (
    <Dropdown
      options={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
      onChange={"none"}
      value={"default2Option"}
      placeholder="Select an option"
      width={'100px'}
    />
  );
}