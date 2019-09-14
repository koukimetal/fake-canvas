import React from "react";
import "./App.css";
import { Canvas } from "./components/Canvas";

const App: React.FC = () => {
  return (
    <div className="App">
      <Canvas />
      <div>
        Icons made by{" "}
        <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
          Freepik
        </a>{" "}
        from{" "}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </div>
  );
};

export default App;
