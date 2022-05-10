import axios from 'axios';

import MaterialsManagement from './components/MaterialsManagement';

import './App.css';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  return (
    <div className='App'>
      <MaterialsManagement className='material-management' />
    </div>
  );
};

export default App;
