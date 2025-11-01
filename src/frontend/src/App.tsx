import "./styles/App.scss";
import { MainPage } from './pages';
import { BackendTest } from './components';
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  return (
    <div className="main">
     <BackendTest />
     <MainPage />
    </div>
  )
}

export default App
