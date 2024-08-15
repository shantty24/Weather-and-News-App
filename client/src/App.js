import { useContext, useEffect, useState } from "react";
import Header from "./Components/Header";
import { Outlet } from "react-router";
import Footer from "./Components/Footer";
import { useNavigate, useLocation } from "react-router";
import "./App.css";
import { Contexts } from "./context/contexts";
import Login from "./Components/Login";
function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchInputChange = (e) => {
    const { pathname } = location;
    setSearchQuery(e.target.value);
    console.log(e.target.value === "");
    if (e.target.value === "") {
      setSearchQuery("Indore");
    }

    if (pathname.includes("/home/news")) {
      navigate(
        `/home/news/${e.target.value === "" ? "indore" : e.target.value}`
      );
    } else if (pathname.includes("/home/weather")) {
      navigate(
        `/home/weather/${e.target.value === "" ? "indore" : e.target.value}`
      );
    }
  };
  const [authenticate, setAuthenticate] = useState(true);
  const { isLoggedIn } = useContext(Contexts);

  useEffect(() => {
    setAuthenticate(isLoggedIn);
  }, [isLoggedIn]);
  return (

      <>
        <Header onSearchInputChange={handleSearchInputChange} />
        <Outlet />
        <Footer />
      </>

  );
}

export default App;
