
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import { EditorProvider } from './store/EditorContext';

function App() {
  return (
    <EditorProvider>
      <div className="app-container">
        <Header />
        <div className="app-main">
          <Sidebar />
          <div className="app-workspace dot-pattern">
            <EditorCanvas />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;
