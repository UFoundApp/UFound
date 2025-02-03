import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import ViewPost from './Posts/ViewPost';

function App() {
  return (
    <Router>
      <div className="App">

        <Routes>
          <Route path="/view-post/:id" element={<ViewPost/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
